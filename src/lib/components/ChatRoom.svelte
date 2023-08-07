<script lang="ts">
  import Answer from '$lib/components/Answer.svelte'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import Question from '$lib/components/Question.svelte'
  import RoleSelector from '$lib/components/RoleSelector.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  export let chat: ChatWithRelations
  let messages: ChatWithRelations['messages'] = []

  $: if (chat) {
    messages = chat?.messages
    setTimeout(() => {
      scrollToBottom(element)
    }, 100)
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

    setTimeout(() => {
      scrollToBottom(element)
    }, 100)
  }

  let selectedRolePrompt: string | null = 'You are a helpful assistant.'
  let element: HTMLElement

  onMount(() => {
    setTimeout(() => {
      scrollToBottom(element)
    }, 100)
  })

  const scrollToBottom = (node: HTMLElement) => {
    node?.scroll({ top: node.scrollHeight, behavior: 'smooth' })
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
      {#each messages as message}
        <div in:fade={{ duration: 400 }}>
          <Question
            text={message.question}
            author={message.author?.name || chat?.owner.user.name}
          />
        </div>
        <div in:fade={{ delay: 400, duration: 400 }}>
          <Answer text={message.answer} />
        </div>
      {/each}
    </div>
  {/if}

  <div class="self-end py-3 md:py-6 w-full bg-gray-900">
    <ChatInput chatId={chat?.id} role={selectedRolePrompt} on:message={addPlaceholderMessage} />
  </div>
</div>
