import { t } from "elysia";
import { usersService } from "../services/UserService";

export const usersHandler = {
  getAll: async () => {
    const users = await usersService.getAll();
    return {
      message: "get-success",
      data: users,
    };
  },

  create: async ({ body, set }) => {
    await usersService.verifyEmailIsAvailable(body.email);

    const passwordHash = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: parseInt(process.env.BUN_COST),
    });

    const user = await usersService.create({
      ...body,
      password: passwordHash,
    });
    set.status = 201;
    return { message: "create-success", data: user };
  },

  getByUuid: async ({ set, params: { uuid } }) => {
    const user = await usersService.getByUuid(uuid);

    set.status = 200;
    return {
      message: "get-success",
      data: user,
    };
  },

  delete: async ({ params: { uuid } }) => {
    await usersService.delete(uuid);

    return {
      message: `delete-success`,
    };
  },

  login: async ({ jwt, setCookie, body, set }) => {
    const hashedPassword = await usersService.getPasswordByEmail(body.email);
    const isMatch = await Bun.password.verify(body.password, hashedPassword);

    if (!isMatch) {
      set.status = 401;
      return {
        status: "failed",
        message: `email-or-password-invalid`,
      };
    }
    const login = await usersService.login({
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

  validateCreate: t.Object({
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
