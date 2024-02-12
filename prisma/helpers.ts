import { PrismaClient } from '@prisma/client'

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
