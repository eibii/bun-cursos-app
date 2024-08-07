import { t } from "elysia";
import { groupsService } from "../services/GroupService";

export const groupsHandler = {
  getGroups: async ({ cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    const groups = await groupsService.getGroups(uuid);
    return {
      message: "get-success",
      data: groups,
    };
  },

  createGroup: async ({ body, set, cookie: { auth }, jwt }) => {
    const { uuid } = await jwt.verify(auth);
    const user = await groupsService.createGroup(body, uuid);
    set.status = 201;
    return { message: "create-success", data: user };
  },

  updateGroup: async ({ body, set }) => {
    const user = await groupsService.updateGroup(body);
    set.status = 201;
    return { message: "create-success", data: user };
  },

  getGroupByUuid: async ({ set, params: { uuid } }) => {
    const user = await groupsService.getGroupByUuid(uuid);

    set.status = 200;
    return {
      message: "get-success",
      data: user,
    };
  },

  deleteGroup: async ({ params: { uuid } }) => {
    await groupsService.deleteGroup(uuid);

    return {
      message: `delete-success`,
    };
  },

  validateCreateGroup: t.Object({
    name: t.String({
      minLength: 1,
      maxLength: 167,
    }),
    icon: t.String(),
  }),

  validateUpdateGroup: t.Object({
    name: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 167,
      })
    ),
    icon: t.Optional(t.String()),
  }),
};
