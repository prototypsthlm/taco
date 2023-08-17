<script lang="ts">
  import ChatInput from '$lib/components/ChatInput.svelte'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import RoleSelector from '$lib/components/RoleSelector.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { slide } from 'svelte/transition'

  export let chat: ChatWithRelations | undefined
  export let error: any
  let messages: ChatWithRelations['messages'] = []

  $: {
    messages = chat?.messages || []
  }

  function addPlaceholderMessage(event: CustomEvent<string>) {
    const message = event.detail

    messages = [
      ...messages,
      {
        question: message,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ChatWithRelations['messages'][number],
    ]

    scrollToBottom(element)
  }

  let selectedRolePrompt: string | null = 'You are a helpful assistant.'
  let element: HTMLElement

  onMount(() => {
    scrollToBottom(element)
  })

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
</script>

<div class="flex flex-col justify-between items-center h-full w-full">
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
    <ChatInput chatId={chat?.id} role={selectedRolePrompt} on:message={addPlaceholderMessage} />
  </div>
</div>
