import { prisma } from '$lib/server/prisma'
import { decryptString } from '$lib/server/utils/crypto'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const chats = await prisma.chat.findMany({
    where: {
      owner: {
        userId: locals.currentUser.id,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      name: locals.currentUser.name,
      email: locals.currentUser.email,
    },
    chats: chats.map((chat) => {
      const shouldDecrypt = chat.encrypted

      const name = chat.name ? (shouldDecrypt ? decryptString(chat.name) : chat.name) : null

      const messages = chat.messages.map((msg) => ({
        id: msg.id,
        question: shouldDecrypt ? decryptString(msg.question) : msg.question,
        answer: msg.answer ? (shouldDecrypt ? decryptString(msg.answer) : msg.answer) : null,
        createdAt: msg.createdAt,
      }))

      return {
        id: chat.id,
        name,
        model: chat.model,
        createdAt: chat.createdAt,
        messages,
      }
    }),
  }

  return json(exportData)
}
