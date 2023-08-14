<script lang="ts">
  import ChatInput from '$lib/components/ChatInput.svelte'
  import ChatMessage from '$lib/components/ChatMessage.svelte'
  import RoleSelector from '$lib/components/RoleSelector.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { quintOut } from 'svelte/easing'
  import { crossfade } from 'svelte/transition'

  export let chat: ChatWithRelations | undefined
  let messages: ChatWithRelations['messages'] = []

  $: {
    messages = chat?.messages || []
    scrollToBottom(element)
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

  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node, params) {
      const style = getComputedStyle(node)
      const height = parseFloat(style.height)

      return {
        duration: 600,
        easing: quintOut,
        css: (to: number) => {
          const adjustedOpacity = Math.min(1, Math.pow(to, 2))
          return `
          min-height: ${height * to}px;
          height: ${height * to}px;
          overflow: hidden;
          opacity: ${adjustedOpacity};
        `
        },
      }
    },
  })
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
        <div out:send={{ key: message.id }} animate:flip={{ duration: (d) => d * 0.5 }}>
          <ChatMessage
            {chat}
            {message}
            on:delete={(e) => {
              messages = messages.filter((x) => x.id !== e.detail.messageId)
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
