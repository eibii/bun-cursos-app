import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from "../exceptions/InvariantError";
import { ConflictError } from "../exceptions/ConflictError";

const db = new PrismaClient();

type CreateChatPayload = {
  slug: string;
  name: string;
  promptText: string;
  urlFile: string;
  groupUuid: string;
};

export const chatsService = {
  getChats: async ({
    userUuid,
    groupUuid,
  }: {
    userUuid: string;
    groupUuid: string;
  }) => {
    const user = await db.user.findFirst({
      where: {
        uuid: userUuid,
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundError("user-not-found");

    const group = await db.group.findFirst({
      where: {
        uuid: groupUuid,
      },
      select: {
        id: true,
      },
    });

    if (!group) throw new NotFoundError("group-not-found");

    return await db.chatTTS.findMany({
      where: {
        user: {
          id: user.id,
        },
        group: {
          id: group.id,
        },
      },
      select: {
        uuid: true,
        slug: true,
        name: true,
        promptText: true,
        urlFile: true,
        group: {
          select: {
            uuid: true,
            slug: true,
            name: true,
          },
        },
      },
    });
  },

  createChat: async (payload: CreateChatPayload, userUuid: string) => {
    const chatExist = await db.chatTTS.findFirst({
      where: {
        slug: payload.slug,
      },
      select: {
        id: true,
      },
    });

    if (chatExist) throw new ConflictError("chat-exist");

    const user = await db.user.findFirst({
      where: {
        uuid: userUuid,
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundError("user-not-found");

    const group = await db.group.findFirst({
      where: {
        uuid: payload.groupUuid,
      },
      select: {
        id: true,
      },
    });

    if (!group) throw new NotFoundError("group-not-found");

    const chat = await db.chatTTS.create({
      data: {
        slug: payload.slug,
        name: payload.name,
        promptText: payload.promptText,
        urlFile: payload.urlFile,
        user: {
          connect: {
            id: user.id,
          },
        },
        group: {
          connect: {
            id: group.id,
          },
        },
      },
      select: {
        uuid: true,
      },
    });

    if (!chat) throw new InvariantError("chat-failed-add");
    return chat;
  },

  getChatByUuid: async (uuid: string) => {
    const chat = await db.chatTTS.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select: {
        uuid: true,
        slug: true,
        name: true,
        promptText: true,
        urlFile: true,
        group: {
          select: {
            uuid: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!chat) throw new NotFoundError("chat-not-found");
    return chat;
  },

  deleteChat: async (uuid: string) => {
    const chat = await db.chatTTS.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select: {
        id: true,
      },
    });

    if (!chat) throw new NotFoundError("chat-not-found");

    await db.chatTTS.delete({
      where: {
        id: chat.id,
      },
    });
  },
};
