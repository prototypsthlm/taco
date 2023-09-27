<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/stores'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import PersonalitySelector from '$lib/components/PersonalitySelector.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import type { LlmPersonality } from '@prisma/client'
  import ioClient from 'socket.io-client'
  import { SSE } from 'sse.js'
  import { onDestroy, onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { slide } from 'svelte/transition'

  export let user: UserWithUserTeamsActiveTeamAndChats
  export let chat: ChatWithRelations | undefined = undefined
  export let customPersonalities: LlmPersonality[] | null = null

  let loading = false
  let selectedPersonalityContext: string | null = 'You are a helpful assistant.'
  let element: HTMLElement
  let eventSource: SSE | undefined
  const io = ioClient()

  let usersTyping: string[] = []
  let connectedUsers: string[] = []
  let prevChatId: number | undefined

  function joinChat(userId: number, chatId: number) {
    if (!io.connected) {
      io.connect()
    }

    io.emit('join-chat', { userId, chatId })

    io.on('connected-users-changed', (updatedConnectedUsers) => {
      connectedUsers = updatedConnectedUsers
    })

    io.on('users-typing-changed', (updatedUsersTyping) => {
      usersTyping = updatedUsersTyping
    })
  }

  function leaveChat(userId: number, chatId: number) {
    io.off('connected-users-changed')
    io.off('users-typing-changed')
    io.emit('stopped-typing', { userId, chatId })
    io.emit('leave-chat', { userId, chatId })
  }

  onMount(() => {
    console.log('onmount')
    scrollToBottom()
    if (chat?.id) {
      joinChat(user.id, chat.id)
    }
  })

  onDestroy(() => {
    if (chat?.id) {
      leaveChat(user.id, chat.id)
    }
    eventSource?.close()
    io.disconnect()
  })

  $: if (chat?.id && chat?.id !== prevChatId) {
    if (prevChatId) {
      console.log('leaveChat YES', { chatId: chat.id, prevChatId })
      leaveChat(user.id, prevChatId)
    } else {
      console.log('leaveChat NO', { chatId: chat.id, prevChatId })
    }
    joinChat(user.id, chat.id)
    prevChatId = chat.id
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      element?.scroll({ top: element.scrollHeight, behavior: 'smooth' })
    }, 500)
  }

  async function deleteMessage(id: number) {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })

    const json = await res.json()
    if (json?.success && chat?.messages) {
      chat.messages = chat.messages.filter((x) => x.id !== id)
    } else {
      console.error(json?.error)
    }
  }

  async function handleSubmit(event: CustomEvent<{ question: string }>) {
    const { question } = event.detail
    loading = true

    eventSource = new SSE('/api/chats', {
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({
        id: chat?.id,
        role: selectedPersonalityContext,
        question,
      }),
    })

    eventSource.addEventListener('error', handleError)

    eventSource.addEventListener('message', async (e) => {
      try {
        if (e.data.includes('[DONE]')) {
          loading = false
          if ($page.url.pathname !== `/app/chat/${chat?.id}`) {
            await goto(`/app/chat/${chat?.id}`)
          }
          await invalidateAll()
          scrollToBottom()
          eventSource?.close()
          return
        }

        const data = JSON.parse(e.data)

        if (data.chat) {
          chat = data.chat
          scrollToBottom()
        }
      } catch (err) {
        handleError(err)
      }
    })
    eventSource.stream()
  }

  function handleError<T>(err: T) {
    loading = false
    console.error(err)
  }
</script>

<div class="text-white">
  <h1>SOCKET USER {user.id}</h1>
  <h2>JOINED: {JSON.stringify(connectedUsers)}</h2>
  <h2>TYPING: {JSON.stringify(usersTyping)}</h2>
</div>

<div class="flex flex-col justify-between items-center h-full w-full">
  {#if !chat?.messages?.length}
    <div class="flex flex-col gap-3 md:gap-4 justify-center items-center text-center grow h-full">
      <h1 class="text-accent text-2xl md:text-5xl font-bold">New Chat!</h1>
      <p class="text-accent text-md px-8 md:text-2xl">
        Choose your taco topping or bring your
        <a href="/app/settings/customization" class="text-indigo-500"> own topping </a>
      </p>
      <PersonalitySelector
        {customPersonalities}
        on:roleChange={(event) => (selectedPersonalityContext = event.detail.context)}
      />
    </div>
  {:else}
    <div bind:this={element} class="flex flex-col w-full h-full overflow-scroll">
      {#each chat?.messages as message (message.id)}
        <div out:slide animate:flip={{ duration: (d) => d * 1.2 }}>
          <ChatMessage
            {chat}
            {message}
            on:delete={() => {
              deleteMessage(message.id)
            }}
          />
        </div>
      {/each}
    </div>
  {/if}

  <div class="self-end py-3 md:py-6 w-full bg-gray-900">
    <ChatInput
      {loading}
      on:message={handleSubmit}
      on:focus={() => {
        io.emit('start-typing', { userId: user.id, chatId: chat?.id })
      }}
      on:blur={() => {
        io.emit('stop-typing', { userId: user.id, chatId: chat?.id })
      }}
    />
  </div>
</div>
