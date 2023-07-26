<script lang="ts">
  import Answer from '$lib/components/Answer.svelte'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import Question from '$lib/components/Question.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { fade } from 'svelte/transition'
  import RoleSelector from './RoleSelector.svelte'

  export let chat: ChatWithRelations | null
  let messages: ChatWithRelations['messages'][number] = []

  $: if (chat) {
    messages = chat?.messages
  }

  function addPlaceholderMessage(event) {
    const message = event.detail

    messages = [
      ...messages,
      {
        question: message,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
  }
</script>

<div class="flex flex-col justify-between items-center h-full w-full">
  {#if !messages.length}
    <div class="flex flex-col gap-4 justify-center items-center flex-grow h-full">
      <h1 class="text-accent text-5xl font-bold">New Chat!</h1>
      <p class="text-accent text-2xl">Choose your LLM personality</p>
      <RoleSelector />
    </div>
  {:else}
    <div class="flex flex-col w-full h-full overflow-scroll">
      {#each messages as message}
        <div in:fade={{ duration: 400 }}>
          <Question text={message.question} author={message.author} />
        </div>
        <div in:fade={{ delay: 400, duration: 400 }}>
          <Answer text={message.answer} />
        </div>
      {/each}
    </div>
  {/if}

  <div class="self-end py-3 md:py-6 w-full bg-gray-900">
    <ChatInput chatId={chat?.id} on:message={addPlaceholderMessage} />
  </div>
</div>
