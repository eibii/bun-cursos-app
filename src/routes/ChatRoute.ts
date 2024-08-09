import { chatsHandler } from "../handlers/ChatHandler";
import { apiMiddleware } from "../middleware/ApiMiddleware";

export default (app) =>
  app
    .guard({ query: chatsHandler.validateQuery }, (guardApp) =>
      guardApp.get("/", chatsHandler.getAll, {
        beforeHandle: apiMiddleware,
      })
    )
    .guard({ body: chatsHandler.validateCreate }, (guardApp) =>
      guardApp.post("/", chatsHandler.create)
    )
    .guard({ body: chatsHandler.validateUpdate }, (guardApp) =>
      guardApp.put("/", chatsHandler.update)
    )

    .get("/:uuid", chatsHandler.getByUuid, {
      beforeHandle: apiMiddleware,
    })
    .delete("/:uuid", chatsHandler.delete, {
      beforeHandle: apiMiddleware,
    });
