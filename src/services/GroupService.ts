import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from "../exceptions/InvariantError";
import { ConflictError } from "../exceptions/ConflictError";

const db = new PrismaClient();

type CreateGroupPayload = {
  name: string;
  icon: string;
};

type UpdateGroupPayload = {
  uuid: string;
  name: string;
  icon: string;
};

export const groupsService = {
  getGroups: async (userUuid: string) => {
    return await db.group.findMany({
      where: {
        user: {
          uuid: userUuid,
        },
      },
      select: {
        uuid: true,
        name: true,
        icon: true,
      },
    });
  },

  createGroup: async (payload: CreateGroupPayload, userUuid: string) => {
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
      select: {
        uuid: true,
      },
    });

    if (!group) throw new InvariantError("group-failed-add");
    return group;
  },

  updateGroup: async (payload: UpdateGroupPayload) => {
    const group = await db.group.updateMany({
      where: {
        uuid: payload.uuid,
      },
      data: {
        name: payload.name,
        icon: payload.icon,
      },
    });

    if (!group) throw new InvariantError("group-failed-add");
    return group;
  },

  getGroupByUuid: async (uuid: string) => {
    const group = await db.group.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select: {
        uuid: true,
        name: true,
        icon: true,
      },
    });

    if (!group) throw new NotFoundError("group-not-found");
    return group;
  },

  deleteGroup: async (uuid: string) => {
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
