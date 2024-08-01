import { t } from "elysia";
import { chatsService } from "../services/ChatService";

export const chatsHandler = {
  getChats: async ({ query, cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    const { groupUuid } = query;
    const chats = await chatsService.getChats({
      userUuid: uuid,
      groupUuid,
    });
    return {
      message: "get-success",
      data: chats,
    };
  },

  createChat: async ({ body, set, cookie: { auth }, jwt  }) => {
    const { uuid } = await jwt.verify(auth);
    const chat = await chatsService.createChat(body, uuid);
    set.status = 201;
    return { message: "create-success", data: chat };
  },

  getChatByUuid: async ({ set, params: { uuid } }) => {
    const chat = await chatsService.getChatByUuid(uuid);

    set.status = 200;
    return {
      message: "get-success",
      data: chat,
    };
  },

  deleteChat: async ({ params: { uuid } }) => {
    await chatsService.deleteChat(uuid);

    return {
      message: `delete-success`,
    };
  },

  validateCreateChat: t.Object({
    slug: t.String({
      minLength: 1,
      maxLength: 167,
    }),
    name: t.String({
      minLength: 1,
      maxLength: 167,
    }),
    promptText: t.String(),
    urlFile: t.String(),
    groupUuid: t.String(),
  }),

  validateQueryGet: t.Object({
    groupUuid: t.String(),
  }),
};
