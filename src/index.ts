import { Elysia } from "elysia";

import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import bearer from "@elysiajs/bearer";

import { AuthenticationError } from "./exceptions/AuthenticationError";
import { AuthorizationError } from "./exceptions/AuthorizationError";
import { InvariantError } from "./exceptions/InvariantError";
import { ConflictError } from "./exceptions/ConflictError";

import configureUserRoutes from "./routes/UserRoute";
import configureGroupRoutes from "./routes/GroupRoute";
import configureChatRoutes from "./routes/ChatRoute";
import configureAuthenticationRoutes from "./routes/AuthenticationRoute";

export const app = new Elysia({
  prefix: process.env.BUN_PREFIX || "/api",
  serve: {
    hostname: process.env.BUN_HOST,
  },
})
  .error("AUTHENTICATION_ERROR", AuthenticationError)
  .error("AUTHORIZATION_ERROR", AuthorizationError)
  .error("INVARIANT_ERROR", InvariantError)
  .error("CONFLICT_ERROR", ConflictError)
  .onError(({ code, error, set }) => {
    switch (code) {
      case "CONFLICT_ERROR":
        set.status = 409;
        return {
          status: 409,
          message: error.message || "conflict-error",
        };
      case "AUTHENTICATION_ERROR":
        set.status = 401;
        return {
          status: 401,
          message: error.message || "authentication-error",
        };
      case "AUTHORIZATION_ERROR":
        set.status = 403;
        return {
          status: 403,
          message: error.message || "authorization-error",
        };
      case "INVARIANT_ERROR":
        set.status = 400;
        return {
          status: "error",
          message: error.message || "invariant-error",
        };
      case "NOT_FOUND":
        set.status = 404;
        return {
          status: 404,
          message: error.message || "not-found",
        };
      case "INTERNAL_SERVER_ERROR":
        set.status = 500;
        return {
          status: 500,
          message: error.message || "internal-server-error",
        };
    }
  })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET,
      exp: process.env.JWT_EXP,
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: process.env.JWT_REFRESH,
    })
  )
  .use(cookie())
  .use(cors())
  .use(bearer())
  .use(
    swagger({
      path: "/swagger",
    })
  );

app
  .get("/", () => `Welcome to Bun Elysia`)
  .group("/users", configureUserRoutes)
  .group("/groups", configureGroupRoutes)
  .group("/chats", configureChatRoutes)
  .group("/authentications", configureAuthenticationRoutes)
  .listen(process.env.BUN_PORT || 3030);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
