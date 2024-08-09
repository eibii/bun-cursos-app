import { groupsHandler } from "../handlers/GroupHandler";
import { apiMiddleware } from "../middleware/ApiMiddleware";

export default (app) =>
  app
    .get("/", groupsHandler.getAll, {
      beforeHandle: apiMiddleware,
    })
    .guard({ body: groupsHandler.validateCreate }, (guardApp) =>
      guardApp.post("/", groupsHandler.create)
    )
    .guard(
      {
        body: groupsHandler.validateUpdate,
      },
      (guardApp) => guardApp.put("/", groupsHandler.update)
    )
    .get("/:uuid", groupsHandler.getByUuid, {
      beforeHandle: apiMiddleware,
    })
    .delete("/:uuid", groupsHandler.delete, {
      beforeHandle: apiMiddleware,
    });
