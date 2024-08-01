import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from "../exceptions/InvariantError";
import { ConflictError } from "../exceptions/ConflictError";

const db = new PrismaClient();

type CreateGroupPayload = {
  slug: string;
  name: string;
  icon: string;
};

type UpdateGroupPayload = {
  uuid: string;
  slug: string;
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
        slug: true,
        name: true,
        icon: true,
      },
    });
  },

  createGroup: async (payload: CreateGroupPayload, userUuid: string) => {
    const groupExist = await db.group.findFirst({
      where: {
        slug: payload.slug,
      },
      select: {
        id: true,
      },
    });

    if (groupExist) throw new ConflictError("group-exist");

    const user = await db.user.findFirst({
      where: {
        uuid: userUuid,
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundError("user-not-found");

    const group = await db.group.create({
      data: {
        slug: payload.slug,
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
        slug: payload.slug,
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
        slug: true,
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
