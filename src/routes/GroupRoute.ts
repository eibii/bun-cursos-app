import { groupsHandler } from "../handlers/GroupHandler";
import { apiMiddleware } from "../middleware/ApiMiddleware";

export function configureGroupRoutes(app) {
  return app
    .get("/", groupsHandler.getGroups, {
      beforeHandle: apiMiddleware,
    })
    .guard({ body: groupsHandler.validateCreateGroup }, (guardApp) =>
      guardApp.post("/", groupsHandler.createGroup)
    )
    .guard({ body: groupsHandler.validateUpdateGroup }, (guardApp) =>
      guardApp.put("/", groupsHandler.updateGroup)
    )
    .get("/:uuid", groupsHandler.getGroupByUuid, {
      beforeHandle: apiMiddleware,
    })
    .delete("/:uuid", groupsHandler.deleteGroup, {
      beforeHandle: apiMiddleware,
    });
}
