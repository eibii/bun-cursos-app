FROM oven/bun:latest

WORKDIR /home/bun/app

COPY package.json .
COPY bun.lockb .
COPY prisma prisma
COPY .env .

RUN bun install --production
RUN bunx prisma migrate dev && bunx prisma generate

COPY src src
COPY tsconfig.json .
# COPY public public

ENV NODE_ENV production
CMD [ "bun", "src/index.ts"]

EXPOSE 3000