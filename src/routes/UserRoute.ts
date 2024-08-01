import { usersHandler } from "../handlers/UserHandler";
import { apiMiddleware } from "../middleware/ApiMiddleware";

export function configureUserRoutes(app) {
  return (
    app
      // .get("/", usersHandler.getUsers, {
      //   beforeHandle: apiMiddleware,
      // })
      .guard({ body: usersHandler.validateCreateUser }, (guardApp) =>
        guardApp.post("/", usersHandler.createUser)
      )
      .get("/:uuid", usersHandler.getUserByUuid, {
        beforeHandle: apiMiddleware,
      })
      .delete("/:uuid", usersHandler.deleteUser, {
        beforeHandle: apiMiddleware,
      })
      .guard({ body: usersHandler.validateLogin }, (guardApp) =>
        guardApp.post("/login", usersHandler.loginUser)
      )
  );
}
