import { t } from "elysia";
import { usersService } from "../services/UserService";
import { authenticationService } from "../services/AuthenticationService";

export const authenticationHandler = {
  postAuthentication: async ({ jwt, refreshJwt, body, set }) => {
    const userUuid = await usersService.verifyUserByEmail(body.email);

    const access_token = await jwt.sign(userUuid);
    const refresh_token = await refreshJwt.sign(userUuid);

    await authenticationService.addRefreshToken(refresh_token);

    set.status = 201;

    return {
      data: {
        access_token: access_token,
        refresh_token: refresh_token,
      },
    };
  },
  putAuthentication: async ({
    jwt,
    refreshJwt,
    body: { refresh_token },
    set,
  }) => {
    await authenticationService.verifyRefreshToken(refresh_token);

    const tokenPayload = await refreshJwt.verify(refresh_token);
    const access_token = await jwt.sign(tokenPayload);

    set.status = 200;
    return {
      message: "access-token-successfully-updated",
      data: {
        access_token: access_token,
      },
    };
  },
  deleteAuthentication: async ({
    refreshJwt,
    body: { refresh_token },
    set,
  }) => {
    await authenticationService.verifyRefreshToken(refresh_token);

    await refreshJwt.verify(refresh_token);

    set.status = 200;
    return {
      message: "delete-refresh-token-successfully",
    };
  },
  validateBody: t.Object({
    email: t.String({
      format: "email",
    }),
  }),
};
