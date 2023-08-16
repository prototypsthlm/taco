<script lang="ts">
  import ChatInput from '$lib/components/ChatInput.svelte'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import RoleSelector from '$lib/components/RoleSelector.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { slide } from 'svelte/transition'
  import { SSE } from 'sse.js'

  export let chat: ChatWithRelations | undefined
  let messages: ChatWithRelations['messages'] = []
  let loading = false
  let answer = ''

  $: {
    messages = chat?.messages || []
  }

  let selectedRolePrompt: string | null = 'You are a helpful assistant.'
  let element: HTMLElement

  onMount(() => {
    scrollToBottom(element)
  })

  function sendMessage(event: CustomEvent<{ question: string }>) {
    const { question } = event.detail

    messages = [
      ...messages,
      {
        question,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ChatWithRelations['messages'][number],
    ]

    scrollToBottom(element)
  }

  const scrollToBottom = (node: HTMLElement) => {
    setTimeout(() => {
      node?.scroll({ top: node.scrollHeight, behavior: 'smooth' })
    }, 500)
  }

  async function deleteMessage(id: number) {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })

    const json = await res.json()
    if (json?.success && chat) {
      chat.messages = chat.messages.filter((x) => x.id !== id)
    } else {
      console.log(json?.error)
    }
  }

  async function handleSubmit(event: CustomEvent<{ question: string }>) {
    const { question } = event.detail
    loading = true

    const eventSource = new SSE('/api/chats', {
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

    eventSource.addEventListener('message', (e) => {
      scrollToBottom(element)
      try {
        if (e.data === '[DONE]') {
          loading = false
          console.log(e.data)
          return
        }

        const completionResponse = JSON.parse(e.data)
        const [{ delta }] = completionResponse.choices

        if (delta.content) {
          answer = (answer ?? '') + delta.content
        }
      } catch (err) {
        handleError(err)
      }
    })
    eventSource.stream()
    scrollToBottom(element)
  }

  function handleError<T>(err: T) {
    loading = false
    console.error(err)
  }
</script>

<div class="flex flex-col justify-between items-center h-full w-full">
  <div class="text-white">
    {#if loading}
      <h1>LOADDDDDDDDDDDDDDDDDDDDDINNNNNNNNNNNNNG</h1>
    {/if}
    ANSWER: {answer}
  </div>
  {#if !messages.length}
    <div class="flex flex-col gap-4 justify-center items-center grow h-full">
      <h1 class="text-accent text-5xl font-bold">New Chat!</h1>
      <p class="text-accent text-2xl">Choose your LLM personality</p>
      <RoleSelector on:roleChange={(event) => (selectedRolePrompt = event.detail.prompt)} />
      <p class="text-accent max-w-2xl text-center text-xl text-opacity-70">{selectedRolePrompt}</p>
    </div>
  {:else}
    <div bind:this={element} class="flex flex-col w-full h-full overflow-scroll">
      {#each messages as message (message.id)}
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
