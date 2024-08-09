import { NotFoundError } from "elysia";
import { InvariantError } from "../exceptions/InvariantError";
import { ConflictError } from "../exceptions/ConflictError";
import { db } from "../lib/db";

type CreatePayload = {
  name: string;
  icon: string;
};

type UpdatePayload = {
  uuid: string;
  name?: string;
  icon?: string;
};

const select = {
  uuid: true,
  name: true,
  icon: true,
  createdAt: true,
  updatedAt: true,
};

export const groupsService = {
  getAll: async (userUuid: string) => {
    return await db.group.findMany({
      where: {
        user: {
          uuid: userUuid,
        },
      },
      select,
    });
  },

  create: async (payload: CreatePayload, userUuid: string) => {
    const user = await db.user.findFirst({
      where: {
        uuid: userUuid,
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundError("user-not-found");

    const groupExist = await db.group.findFirst({
      where: {
        userId: user.id,
        name: payload.name,
      },
      select: {
        id: true,
      },
    });

    if (groupExist) throw new ConflictError("group-exist");

    const group = await db.group.create({
      data: {
        name: payload.name,
        icon: payload.icon,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      select,
    });

    if (!group) throw new InvariantError("group-failed-add");
    return group;
  },

  update: async (payload: UpdatePayload) => {
    let data = {};

    const findGroup = await db.group.findFirst({
      where: {
        uuid: payload.uuid,
      },
      select: {
        id: true,
      },
    });

    if (!findGroup) throw new NotFoundError("group-not-found");

    if (payload.name) data = { ...data, name: payload.name };
    if (payload.icon) data = { ...data, icon: payload.icon };

    const group = await db.group.update({
      where: {
        id: findGroup.id,
      },
      data,
      select,
    });

    if (!group) throw new InvariantError("group-failed-update");

    return group;
  },

  getByUuid: async (uuid: string) => {
    const group = await db.group.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select,
    });

    if (!group) throw new NotFoundError("group-not-found");
    return group;
  },

  delete: async (uuid: string) => {
    const group = await db.group.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select: {
        id: true,
      },
    });

    if (!group) throw new NotFoundError("group-not-found");

    await db.group.delete({
      where: {
        id: group.id,
      },
    });
  },
};
