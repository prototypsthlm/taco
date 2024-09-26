import { PrismaClient } from '@prisma/client'
import { encrypt } from '../../helpers.ts'
const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async (tx) => {
    const unencryptedChats = await tx.chat.findMany({
      where: {
        encrypted: false,
      },
      include: {
        messages: true,
      },
    })

    const key = process.env.SECRET_KEY

    if (!key) {
      throw new Error('SECRET_KEY is not set')
    }

    for (const chat of unencryptedChats) {
      console.log('Encrypting chat:', chat.id)
      const messages = chat.messages
      const encryptedMessages = messages.map((message) => {
        return {
          ...message,
          question: encrypt(message.question, key),
          answer: message.answer ? encrypt(message.answer, key) : null,
        }
      })
      await tx.chat.update({
        where: { id: chat.id },
        data: {
          encrypted: true,
          name: chat.name ? encrypt(chat.name, key) : null,
          messages: {
            updateMany: encryptedMessages.map((message) => ({
              where: { id: message.id },
              data: {
                question: message.question,
                answer: message.answer,
              },
            })),
          },
        },
      })
    }

    console.log('Encrypted chats:', unencryptedChats.length)
  })
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
