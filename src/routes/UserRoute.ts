import { usersHandler } from "../handlers/UserHandler";
import { apiMiddleware } from "../middleware/ApiMiddleware";

export default (app) =>
  app
    .guard({ body: usersHandler.validateCreate }, (guardApp) =>
      guardApp.post("/", usersHandler.create)
    )
    .get("/:uuid", usersHandler.getByUuid, {
      beforeHandle: apiMiddleware,
    })
    .delete("/:uuid", usersHandler.delete, {
      beforeHandle: apiMiddleware,
    })
    .guard({ body: usersHandler.validateLogin }, (guardApp) =>
      guardApp.post("/login", usersHandler.login)
    );
