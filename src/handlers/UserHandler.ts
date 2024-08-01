import { t } from "elysia";
import { usersService } from "../services/UserService";

export const usersHandler = {
  getUsers: async () => {
    const users = await usersService.getUsers();
    return {
      message: "get-success",
      data: users,
    };
  },

  createUser: async ({ body, set }) => {
    await usersService.verifyEmailIsAvailable(body.email);

    const passwordHash = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: parseInt(process.env.BUN_COST),
    });

    const user = await usersService.createUser({
      ...body,
      password: passwordHash,
    });
    set.status = 201;
    return { message: "create-success", data: user };
  },

  getUserByUuid: async ({ set, params: { uuid } }) => {
    const user = await usersService.getUserByUuid(uuid);

    set.status = 200;
    return {
      message: "get-success",
      data: user,
    };
  },

  deleteUser: async ({ params: { uuid } }) => {
    await usersService.deleteUser(uuid);

    return {
      message: `delete-success`,
    };
  },

  loginUser: async ({ jwt, setCookie, body, set }) => {
    const hashedPassword = await usersService.getPasswordByEmail(body.email);
    const isMatch = await Bun.password.verify(body.password, hashedPassword);

    if (!isMatch) {
      set.status = 401;
      return {
        status: "failed",
        message: `email-or-password-invalid`,
      };
    }
    const login = await usersService.loginUser({
      email: body.email,
      password: hashedPassword,
    });
    let token = "";

    if (body.rememberMe) {
      token = await jwt.sign(login);

      setCookie("auth", token, {
        httpOnly: true,
        maxAge: 4 * 86400,
      });
    }

    set.status = 200;
    return {
      message: "login-success",
      data: {
        token,
      },
    };
  },

  validateCreateUser: t.Object({
    email: t.String({
      format: "email",
    }),
    password: t.String({
      minLength: 8,
    }),
  }),

  validateLogin: t.Object({
    rememberMe: t.Boolean(),
    email: t.String({
      format: "email",
    }),
    password: t.String({
      minLength: 8,
    }),
  }),
};
