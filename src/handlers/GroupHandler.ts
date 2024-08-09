import { t } from "elysia";
import { groupsService } from "../services/GroupService";

export const groupsHandler = {
  getAll: async ({ cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    const groups = await groupsService.getAll(uuid);
    return {
      message: "get-success",
      data: groups,
    };
  },

  create: async ({ body, set, cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    console.log("body", body);

    const user = await groupsService.create(body, uuid);
    set.status = 201;
    return { message: "create-success", data: user };
  },

  update: async ({ body, set }) => {
    const user = await groupsService.update(body);
    set.status = 201;
    return { message: "create-success", data: user };
  },

  getByUuid: async ({ set, params: { uuid } }) => {
    const user = await groupsService.getByUuid(uuid);

    set.status = 200;
    return {
      message: "get-success",
      data: user,
    };
  },

  delete: async ({ params: { uuid } }) => {
    await groupsService.delete(uuid);

    return {
      message: `delete-success`,
    };
  },

  validateCreate: t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 80,
    }),
    icon: t.String(),
  }),

  validateUpdate: t.Object({
    uuid: t.String(),
    name: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 80,
      })
    ),
    icon: t.Optional(t.String()),
  }),
};
