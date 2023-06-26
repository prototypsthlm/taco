<script lang="ts">
  import ChatInput from '$lib/components/ChatInput.svelte'
  import Question from '$lib/components/Question.svelte'
  import Answer from '$lib/components/Answer.svelte'
  import type { Chat } from '@prisma/client'

  export let chat: any | null

  function handleMessage(event) {
    const message = event.detail

    messages.push({
      question: message,
      id: 0,
      model: null,
      temperature: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      answer: null,
      chatId: 0,
      authorId: null,
    })
  }

  $: messages = chat?.messages || []
</script>

<div class="flex flex-col justify-between items-center h-full w-full">
  {JSON.stringify(chat, null, 2)}


  {#if messages.length === 0}
    <div class="flex flex-col justify-center items-center flex-grow h-full">
      <h1 class="text-accent text-5xl font-bold">New Chat!</h1>
      <p class="text-accent text-2xl">Choose your LLM personality</p>
    </div>
  {:else}
    <div class="flex flex-col w-full h-full overflow-scroll">
      {#each messages as message}
        <Question text={message.question} author={message.author} />
        <Answer text={message.answer} />
      {/each}
    </div>
  {/if}

  <div class="m-4 md:m-8 w-full">
    <form method="POST" action="?/sendMessage" novalidate>
      <ChatInput on:message={handleMessage} />
      {#if chat?.id}
        <input type="hidden" name="chatId" value={chat.id} />
      {/if}
    </form>
  </div>
</div>
