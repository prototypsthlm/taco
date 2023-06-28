<script lang="ts">
  import ChatInput from '$lib/components/ChatInput.svelte'
  import Question from '$lib/components/Question.svelte'
  import Answer from '$lib/components/Answer.svelte'
  import { enhance } from '$app/forms'
  import { fade } from 'svelte/transition'

  export let chat: any | null
  let messages: any = []

  $: if (chat) {
    messages = chat.messages
  }

  function addPlaceholderMessage(message: string) {
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
  {#if messages.length === 0}
    <div class="flex flex-col justify-center items-center flex-grow h-full">
      <h1 class="text-accent text-5xl font-bold">New Chat!</h1>
      <p class="text-accent text-2xl">Choose your LLM personality</p>
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

  <div class="m-4 md:m-8 w-full">
    <form
      method="POST"
      action="?/sendMessage"
      novalidate
      use:enhance={(formElement) => {
        const message = String(formElement.formData.get('message'))
        addPlaceholderMessage(message)
      }}
    >
      <ChatInput />
      {#if chat?.id}
        <input type="hidden" name="chatId" value={chat.id} />
      {/if}
    </form>
  </div>
</div>
