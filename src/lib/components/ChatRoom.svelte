<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/stores'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import RoleSelector from '$lib/components/RoleSelector.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { SSE } from 'sse.js'
  import { onDestroy, onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { slide } from 'svelte/transition'

  export let chat: ChatWithRelations | undefined = undefined

  let loading = false
  let selectedRolePrompt: string | null = 'You are a helpful assistant.'
  let element: HTMLElement
  let eventSource: SSE | undefined

  onMount(() => {
    scrollToBottom()
  })

  onDestroy(() => {
    eventSource?.close()
  })

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
        role: selectedRolePrompt,
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
    <div class="flex flex-col gap-4 justify-center items-center grow h-full">
      <h1 class="text-accent text-5xl font-bold">New Chat!</h1>
      <p class="text-accent text-2xl">Choose your LLM personality</p>
      <RoleSelector on:roleChange={(event) => (selectedRolePrompt = event.detail.prompt)} />
      <p class="text-accent max-w-2xl text-center text-xl text-opacity-70">{selectedRolePrompt}</p>
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
    <ChatInput {loading} on:message={handleSubmit} />
  </div>
</div>
