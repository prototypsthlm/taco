import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

export async function cleanDatabase(providedPrisma?: PrismaClient) {
  const prisma = providedPrisma || new PrismaClient()

  const tables: { tablename: string }[] = await prisma.$queryRawUnsafe(
    `SELECT tablename
     FROM pg_catalog.pg_tables
     WHERE schemaname != 'pg_catalog'
       AND schemaname != 'information_schema'
       AND tablename != '_prisma_migrations';`
  )

  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`)
  }
}

export const encrypt = (text: string, secretKey: string) => {
  const key = crypto.scryptSync(secretKey, 'salt', 32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return iv.toString('base64') + encrypted.toString('base64')
}
