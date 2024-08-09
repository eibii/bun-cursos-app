import { NotFoundError } from "elysia";
import { InvariantError } from "../exceptions/InvariantError";
import { AuthorizationError } from "../exceptions/AuthorizationError";
import { AuthenticationError } from "../exceptions/AuthenticationError";
import { db } from "../lib/db";

type CreateUserPayload = {
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const select = {
  uuid: true,
  email: true,
  password: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      uuid: true,
      slug: true,
      name: true,
      nickname: true,
      avatar: true,
      lastAccessAt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

export const usersService = {
  getAll: async () => {
    return await db.user.findMany({
      select,
    });
  },

  create: async (payload: CreateUserPayload) => {
    const user = await db.user.create({
      data: {
        email: payload.email,
        password: payload.password,
      },
      select,
    });

    if (!user) throw new InvariantError("user-failed-add");
    return user;
  },

  getByUuid: async (uuid: string) => {
    const user = await db.user.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select,
    });

    if (!user) throw new NotFoundError("user-not-found");
    return user;
  },

  delete: async (uuid: string) => {
    const user = await db.user.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundError("user-not-found");

    await db.user.delete({
      where: {
        id: user.id,
      },
    });
  },

  getPasswordByEmail: async (email: string) => {
    const getPassword = await db.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
      select: {
        password: true,
      },
    });

    if (!getPassword) throw new InvariantError("user-not-found");

    return getPassword.password;
  },

  login: async (body: LoginPayload) => {
    const user = await db.user.findFirst({
      where: {
        email: {
          equals: body.email,
        },
        password: {
          equals: body.password,
        },
      },
      select,
    });

    if (!user) throw new AuthenticationError("email-or-password-invalid");
    return user;
  },

  verifyByEmail: async (email: string) => {
    const user = await db.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
      select: {
        uuid: true,
        emailVerified: true,
      },
    });

    if (!user) throw new AuthenticationError("email-or-password-invalid");

    return user;
  },

  verifyByUuid: async (uuid: string) => {
    const user = await db.user.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
    });

    if (!user) throw new AuthorizationError("authorization-failed");
  },

  verifyEmailIsAvailable: async (email: string) => {
    const findUser = await db.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
      select: {
        id: true,
      },
    });

    if (!findUser) throw new InvariantError("email-already-exists");

    const user = await db.user.update({
      where: {
        id: findUser.id,
      },
      data: {
        emailVerified: true,
      },
      select: {
        ...select,
        emailVerified: true,
      },
    });

    return user;
  },
};
