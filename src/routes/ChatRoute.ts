import { chatsHandler } from "../handlers/ChatHandler";
import { apiMiddleware } from "../middleware/ApiMiddleware";

export function configureChatRoutes(app) {
  return app
    .guard({ query: chatsHandler.validateQueryGet }, (guardApp) =>
      guardApp.get("/", chatsHandler.getChats, {
        beforeHandle: apiMiddleware,
      })
    )
    .guard({ body: chatsHandler.validateCreateChat }, (guardApp) =>
      guardApp.post("/", chatsHandler.createChat)
    )
    .get("/:uuid", chatsHandler.getChatByUuid, {
      beforeHandle: apiMiddleware,
    })
    .delete("/:uuid", chatsHandler.deleteChat, {
      beforeHandle: apiMiddleware,
    });
}
