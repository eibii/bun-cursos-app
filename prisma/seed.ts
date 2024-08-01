import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as _ from 'lodash-es'

const { USER_ROOT_PASSWORD, USER_ROOT_EMAIL, USER_ROOT_NAME } = process.env

async function main() {
  const prisma = new PrismaClient()
  // * Encrypt da senha
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(`${USER_ROOT_PASSWORD}`, salt)
  //  * Criando o usuário root
  await prisma.user.create({
    data: {
      email: `${USER_ROOT_EMAIL}`,
      password: passwordHash,
      emailVerified: true,
      profile: {
        create: {
          name: `${USER_ROOT_NAME}`,
          slug: _.lowerCase(`${USER_ROOT_NAME}`),
        },
      },
    },
  })
}

main()
