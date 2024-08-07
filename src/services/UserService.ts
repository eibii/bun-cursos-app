import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from "../exceptions/InvariantError";
import { AuthorizationError } from "../exceptions/AuthorizationError";
import { AuthenticationError } from "../exceptions/AuthenticationError";

const db = new PrismaClient();

type CreateUserPayload = {
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export const usersService = {
  getUsers: async () => {
    return await db.user.findMany({
      select: {
        id: true,
        uuid: true,
        email: true,
      },
    });
  },

  createUser: async (payload: CreateUserPayload) => {
    const user = await db.user.create({
      data: {
        email: payload.email,
        password: payload.password,
      },
      select: {
        uuid: true,
      },
    });

    if (!user) throw new InvariantError("user-failed-add");
    return user;
  },

  getUserByUuid: async (uuid: string) => {
    const user = await db.user.findFirst({
      where: {
        uuid: {
          equals: uuid,
        },
      },
      select: {
        uuid: true,
        email: true,
      },
    });

    if (!user) throw new NotFoundError("user-not-found");
    return user;
  },

  deleteUser: async (uuid: string) => {
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

  loginUser: async (body: LoginPayload) => {
    const user = await db.user.findFirst({
      where: {
        email: {
          equals: body.email,
        },
        password: {
          equals: body.password,
        },
      },
      select: {
        uuid: true,
      },
    });

    if (!user) throw new AuthenticationError("email-or-password-invalid");
    return user;
  },

  verifyUserByEmail: async (email: string) => {
    const user = await db.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
      select: {
        uuid: true,
      },
    });

    if (!user) throw new AuthenticationError("email-or-password-invalid");

    return user;
  },

  verifyUserByUuid: async (uuid: string) => {
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
    const isAvailable = await db.user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (isAvailable) throw new InvariantError("email-already-exists");
  },
};
