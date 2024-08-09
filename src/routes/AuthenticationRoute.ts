import { authenticationHandler } from "../handlers/AuthenticationHandler";

export default (app) =>
  app.guard({ body: authenticationHandler.validateBody }, (guardApp) =>
    guardApp
      .post("/", authenticationHandler.postAuthentication)
      .put("/", authenticationHandler.putAuthentication)
      .delete("/", authenticationHandler.deleteAuthentication)
  );
