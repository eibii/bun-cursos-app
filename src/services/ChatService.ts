import { NotFoundError } from "elysia";
import { InvariantError } from "../exceptions/InvariantError";
import { ConflictError } from "../exceptions/ConflictError";
import { openai } from "../lib/openAI";
import { uploadService } from "./BucketService";
import { db } from "../lib/db";
import * as _ from "lodash-es";

type Chat = {
  groupUuid: string;
  name: string;
  promptText: string;

  quality: "hd" | "sd";
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
};

type ChatUpdate = {
  uuid: string;
  groupUuid: string;
  name?: string;
  promptText?: string;

  quality?: "hd" | "sd";
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
};

const select = {
  uuid: true,
  name: true,
  promptText: true,
  filename: true,
  urlFile: true,
  createdAt: true,
  updatedAt: true,
  group: {
    select: {
      uuid: true,
      name: true,
    },
  },
};

export const chatsService = {
  getAll: async ({
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

    return await db.chat.findMany({
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

  create: async (payload: Chat, userUuid: string) => {
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
    const audioExists = await db.chat.findFirst({
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
    await uploadService.upload(buffer, filename, "audio/mpeg");
    const urlFile = await uploadService.getUrl(filename);
    const chat = await db.chat.create({
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
      select,
    });

    if (!chat) throw new InvariantError("chat-failed-add");
    return chat;
  },

  update: async (payload: ChatUpdate, userUuid: string) => {
    let chat: any = {};
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
    let filename = name ? `${userUuid}_${_.camelCase(name)}.mp3` : "";
    let data = {};

    const findChat = await db.chat.findFirst({
      where: {
        uuid: payload.uuid,
      },
      select: {
        id: true,
        filename: true,
        promptText: true,
      },
    });

    if (!findChat) throw new NotFoundError("chat-not-found");

    if (!_.isEqual(findChat.filename, filename) && filename) {
      const audioExists = await db.chat.findFirst({
        where: {
          filename,
        },
        select: {
          id: true,
        },
      });

      if (audioExists) throw new ConflictError("audio-exist");

      const urlFile = await uploadService.rename(findChat.filename, filename);
      data = { ...data, name, filename, urlFile };
      chat = await db.chat.update({
        where: {
          id: findChat.id,
        },
        data,
        select,
      });
    }

    if (
      !_.isEqual(findChat.promptText, promptText) &&
      promptText &&
      voice &&
      quality
    ) {
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

      filename = chat?.filename || findChat.filename;
      const arrBuffer = await mp3.arrayBuffer();
      const buffer = Buffer.from(arrBuffer);
      await uploadService.upload(buffer, filename, "audio/mpeg", true);
      const urlFile = await uploadService.getUrl(filename);
      data = { ...data, urlFile, promptText };
      chat = await db.chat.update({
        where: {
          id: findChat.id,
        },
        data,
        select,
      });
    }

    if (!chat) throw new InvariantError("chat-failed-update");
    if (_.isEmpty(chat)) throw new InvariantError("chat-not-update");

    return chat;
  },

  getByUuid: async (uuid: string) => {
    const chat = await db.chat.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select,
    });

    if (!chat) throw new NotFoundError("chat-not-found");
    return chat;
  },

  delete: async (uuid: string) => {
    const chat = await db.chat.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select: {
        id: true,
        filename: true,
      },
    });

    if (!chat) throw new NotFoundError("chat-not-found");

    await uploadService.delete(chat.filename);
    await db.chat.delete({
      where: {
        id: chat.id,
      },
    });
  },
};
