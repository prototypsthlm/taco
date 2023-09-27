<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/stores'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import PersonalitySelector from '$lib/components/PersonalitySelector.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import type { SocketUser } from '$lib/stores/socket'
  import { socketUsersStore } from '$lib/stores/socket'
  import { buildSocketUsers, updateSocketUsers } from '$lib/utils/socket'
  import type { LlmPersonality } from '@prisma/client'
  import { io } from 'socket.io-client'
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
  const socket = io()

  let socketUsers: SocketUser[] = []

  function joinChat() {
    socketUsers = buildSocketUsers(user, chat)
    if (!socket.connected) {
      socket.connect()
    }

    socket.emit('join-chat', { userId: user.id, chatId: chat?.id })

    socket.on('connected-users-changed', (connectedUserIds: number[]) => {
      const updatedConnectedUsers = updateSocketUsers(socketUsers, { connectedUserIds })

      socketUsersStore.set(updatedConnectedUsers)
    })

    socket.on('users-typing-changed', (typingUserIds: number[]) => {
      const updatedConnectedUsers = updateSocketUsers(socketUsers, { typingUserIds })

      socketUsersStore.set(updatedConnectedUsers)
    })
  }

  function leaveChat() {
    socketUsers = []
    socket.off('connected-users-changed')
    socket.off('users-typing-changed')
    socket.emit('stopped-typing')
    socket.emit('leave-chat')
  }

  onMount(() => {
    scrollToBottom()
    joinChat()
  })

  onDestroy(() => {
    leaveChat()
    eventSource?.close()
    socket.disconnect()
  })

  $: if (chat?.id) {
    leaveChat()
    joinChat()
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
        socket.emit('start-typing')
      }}
      on:blur={() => {
        socket.emit('stop-typing')
      }}
    />
  </div>
</div>
