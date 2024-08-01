import { authenticationHandler } from "../handlers/AuthenticationHandler";

export function configureAuthenticationRoutes(app) {
  return app.guard({ body: authenticationHandler.validateBody }, (guardApp) =>
    guardApp
      .post("/", authenticationHandler.postAuthentication)
      .put("/", authenticationHandler.putAuthentication)
  );
}
