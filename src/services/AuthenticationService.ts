import { NotFoundError } from "elysia";
import { InvariantError } from "../exceptions/InvariantError";
import { db } from "../lib/db";

export const authenticationService = {
  verifyRefreshToken: async (refresh_token: string) => {
    const token = await db.authentication.findFirst({
      where: {
        token: {
          equals: refresh_token,
        },
      },
    });

    if (!token) throw new NotFoundError("token-not-found");
  },
  addRefreshToken: async (refresh_token: string) => {
    try {
      const token = await db.authentication.create({
        data: {
          token: refresh_token,
        },
      });

      if (!token) throw new InvariantError("token-failed-add");

      return token.token;
    } catch (error) {
      throw new InvariantError("token-failed-add");
    }
  },
};
