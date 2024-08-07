import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from "../exceptions/InvariantError";
import { ConflictError } from "../exceptions/ConflictError";
import { openai } from "../lib/openAI";
import { uploadService } from "./BucketService";
import * as _ from "lodash-es";

const db = new PrismaClient();

type CreateChatPayload = {
  name: string;
  promptText: string;
  groupUuid: string;
  quality: "hd" | "sd";
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
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
        name: true,
        promptText: true,
        urlFile: true,
        group: {
          select: {
            uuid: true,
            name: true,
          },
        },
      },
    });
  },

  createChat: async (payload: CreateChatPayload, userUuid: string) => {
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

    const { name, voice, quality, promptText } = payload;
    const filename = `${userUuid}_${_.camelCase(name)}.mp3`;
    const audioExists = await db.chatTTS.findFirst({
      where: {
        filename,
      },
      select: {
        id: true,
      },
    });

    if (audioExists) throw new ConflictError("audio-exist");

    // Chamada para criar um áudio
    const mp3 = await openai.audio.speech
      .create({
        model: quality === "hd" ? "tts-1-hd" : "tts-1",
        voice,
        input: promptText,
      })
      .catch((err) => {
        console.error(err);
        throw new InvariantError("openai-error-create-audio");
      });

    const arrBuffer = await mp3.arrayBuffer();
    const buffer = Buffer.from(arrBuffer);
    await uploadService.uploadBucket(buffer, filename, "audio/mpeg");
    const urlFile = await uploadService.getUrlBucket(filename);
    const chat = await db.chatTTS.create({
      data: {
        name,
        promptText,
        urlFile,
        filename,
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
        name: true,
        promptText: true,
        urlFile: true,
        group: {
          select: {
            uuid: true,
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
