import { t } from "elysia";
import { chatsService } from "../services/ChatService";

export const chatsHandler = {
  getAll: async ({ query, cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    const { groupUuid } = query;
    const chats = await chatsService.getAll({
      userUuid: uuid,
      groupUuid,
    });
    return {
      message: "get-success",
      data: chats,
    };
  },

  create: async ({ body, set, cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    const chat = await chatsService.create(body, uuid);
    set.status = 201;
    return { message: "create-success", data: chat };
  },

  update: async ({ body, set, cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    const chat = await chatsService.update(body, uuid);
    set.status = 200;
    return { message: "update-success", data: chat };
  },

  getByUuid: async ({ set, params: { uuid } }) => {
    const chat = await chatsService.getByUuid(uuid);

    set.status = 200;
    return {
      message: "get-success",
      data: chat,
    };
  },

  delete: async ({ params: { uuid } }) => {
    await chatsService.delete(uuid);

    return {
      message: `delete-success`,
    };
  },

  validateCreate: t.Object({
    groupUuid: t.String(),
    name: t.String({
      minLength: 1,
      maxLength: 80,
    }),
    promptText: t.String(),

    quality: t.String({
      enum: ["hd", "sd"],
    }),
    voice: t.String({
      enum: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    }),
  }),

  validateUpdate: t.Object({
    uuid: t.String(),
    groupUuid: t.String(),
    name: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 80,
      })
    ),
    promptText: t.Optional(t.String()),
    quality: t.Optional(
      t.String({
        enum: ["hd", "sd"],
      })
    ),
    voice: t.Optional(
      t.String({
        enum: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
      })
    ),
  }),

  validateQuery: t.Object({
    groupUuid: t.String(),
  }),
};
