<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { navigating, page } from '$app/stores'
  import { autoscroll, scrollToBottom } from '$lib/actions/autoscroll'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import PersonalitySelector from '$lib/components/PersonalitySelector.svelte'
  import ScrollToBottomButton from '$lib/components/ScrollToBottomButton.svelte'
  import type { Model } from '$lib/server/api/openai'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { addFlashNotification } from '$lib/stores/notification'
  import {
    type BaseSocketUser,
    socketStore,
    type SocketUser,
    socketUsersStore,
  } from '$lib/stores/socket'
  import { buildSocketUsers, updateSocketUsers } from '$lib/utils/socket'
  import type { LlmPersonality } from '@prisma/client'
  import * as Sentry from '@sentry/svelte'
  import { SSE } from 'sse.js'
  import { onDestroy } from 'svelte'
  import { flip } from 'svelte/animate'
  import { slide } from 'svelte/transition'

  export let user: UserWithUserTeamsActiveTeamAndChats
  export let chat: ChatWithRelations | undefined = undefined
  export let models: Model[]
  export let customPersonalities: LlmPersonality[] | null = null
  export let teamModel: string

  let loading = false
  let selectedPersonalityContext: string | null = 'You are a helpful assistant.'
  let eventSource: SSE | undefined

  let socketUsers: SocketUser[] = []

  let question = ''

  function joinChat() {
    if (!chat) return
    scrollToBottom({ force: true })
    socketUsers = buildSocketUsers(user, chat)
    if (!$socketStore.connected) {
      $socketStore.connect()
    }

    $socketStore.emit('join-chat', { userId: user.id, chatId: chat?.id })

    $socketStore.on('users-changed', (connectedUserIds: BaseSocketUser[]) => {
      const updatedConnectedUsers = updateSocketUsers(socketUsers, connectedUserIds)

      socketUsersStore.set(updatedConnectedUsers)
    })

    $socketStore.on('streaming-response', async (data) => {
      scrollToBottom()

      if (data.state === 'INITIAL' && data.chat) {
        loading = true
        chat = data.chat
      }

      if (chat && data.state === 'PROCESSING' && data.delta) {
        const lastMessage = chat.messages[chat.messages.length - 1]
        lastMessage.answer += data.delta
        chat.messages[chat.messages.length - 1] = lastMessage
      }

      if (chat && data.state === 'DONE') {
        await onAnswerEndCommon()
      }
      scrollToBottom()
    })

    $socketStore.on('message-deleted', async () => {
      await invalidateAll()
      scrollToBottom()
    })

    $socketStore.on('chat-deleted', async () => {
      await invalidateAll()
      await goto(`/app`)
    })
    $socketStore.on('answer-cancelled', async () => {
      await onAnswerEndCommon()
    })
  }

  function leaveChat() {
    socketUsers = []
    $socketStore.off('users-changed')
    $socketStore.off('streaming-response')
    $socketStore.off('message-deleted')
    $socketStore.off('chat-deleted')
    $socketStore.emit('stopped-typing')
    $socketStore.emit('leave-chat')
  }

  onDestroy(() => {
    leaveChat()
    eventSource?.close()
    $socketStore.disconnect()
  })

  let prevChatId: number | undefined

  $: if (chat?.id !== prevChatId) {
    leaveChat()
    joinChat()
    prevChatId = chat?.id
  }

  let isDeleting = false

  async function deleteMessage(id: number) {
    try {
      isDeleting = true
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })

      const json = await res.json()
      if (json?.success && chat?.messages) {
        chat.messages = chat.messages.filter((x) => x.id !== id)
        $socketStore.emit('delete-message')
      } else {
        console.error(json?.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      isDeleting = false
    }
  }

  async function stopSubmit() {
    $socketStore.emit('cancel-answer')
    await onAnswerEndCommon()
  }

  async function handleSubmit(
    event: CustomEvent<{ question: string; model: string; temperature: number }>
  ) {
    const { question: q, model, temperature } = event.detail
    loading = true

    console.log({ q, model, temperature })

    // The following event will be handled by the 'POST: RequestHandler' function in '+server.ts'.
    eventSource = new SSE('/api/chats', {
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify({
        id: chat?.id,
        role: selectedPersonalityContext,
        question: q,
        model,
        temperature,
      }),
    })

    eventSource.addEventListener('error', async (err: { data: string }) => {
      Sentry.captureException(err)

      if (!err.data) {
        return
      }

      const msg = JSON.parse(JSON.parse(err.data).message)

      if (msg) {
        addFlashNotification(msg.title, msg.body, { type: 'ERROR' })
      }
      await onAnswerEndCommon()
    })

    eventSource.addEventListener('message', async (e) => {
      scrollToBottom()
      try {
        const data = JSON.parse(e.data)

        if (data.state === 'ERROR') {
          addFlashNotification(data.title, data.body, { type: 'ERROR' })
          await onAnswerEndCommon()
          return
        }

        $socketStore.emit('stream-response', data)

        if (data.state === 'INITIAL' && data.chat) {
          loading = true
          question = ''
          chat = data.chat
        }

        if (chat && data.state === 'PROCESSING' && data.delta) {
          const lastMessage = chat.messages[chat.messages.length - 1]
          lastMessage.answer += data.delta
          chat.messages[chat.messages.length - 1] = lastMessage
        }

        if (chat && data.state === 'DONE') {
          await onAnswerEndCommon()
          if ($page.url.pathname !== `/app/chats/${chat.id}`) {
            await goto(`/app/chats/${chat.id}`)
          }
        }
      } catch (err) {
        await onAnswerEndCommon()
        Sentry.captureException(err)
        console.error('eventSource.message.catch', { e, err })
      }

      scrollToBottom()
    })

    eventSource.stream()
  }

  async function onAnswerEndCommon() {
    await invalidateAll()
    eventSource?.close()
    loading = false
  }
</script>

<div class="flex flex-col justify-between items-center h-full w-full">
  {#if !chat?.messages?.length}
    <div class="flex flex-col gap-3 md:gap-4 justify-center items-center text-center grow h-full">
      <h1 class="text-neutral-100 text-2xl md:text-5xl font-bold">New Chat!</h1>
      <p class="text-neutral-100 text-md px-8 md:text-2xl">
        Choose your taco topping or bring your
        <a href="/app/settings/customization" class="text-indigo-500"> own topping </a>
      </p>
      <PersonalitySelector
        {customPersonalities}
        on:roleChange={(event) => (selectedPersonalityContext = event.detail.context)}
      />
    </div>
  {:else}
    <div class="w-full h-full overflow-auto relative">
      <div use:autoscroll class="flex flex-col w-full h-full overflow-auto">
        {#each chat.messages as message, i (message.id)}
          <div
            out:slide={{ duration: $navigating ? 0 : 400 }}
            animate:flip={{ duration: $navigating ? 0 : 400 }}
          >
            <ChatMessage
              last={chat.messages.length - 1 === i}
              {loading}
              {message}
              {isDeleting}
              on:delete={() => {
                deleteMessage(message.id)
              }}
            />
          </div>
        {/each}
      </div>
      <ScrollToBottomButton
        class="absolute bottom-4 right-4"
        on:click={() => scrollToBottom({ force: true, ms: 0 })}
      />
    </div>
  {/if}

  <ChatInput
    class="self-end py-3 md:py-6 w-full bg-gray-900"
    {chat}
    {models}
    {loading}
    {teamModel}
    bind:question
    on:message={handleSubmit}
    on:stop={stopSubmit}
    on:focus={() => {
      $socketStore.emit('start-typing')
    }}
    on:blur={() => {
      $socketStore.emit('stop-typing')
    }}
  />
</div>
