<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import ChatGptIcon from '$lib/components/icons/ChatGptIcon.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { markdownToHtml } from '$lib/utils/markdown.js'
  import { TrashIcon } from '@babeard/svelte-heroicons/outline'
  import { ArrowPathIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher } from 'svelte'
  import Alert from './Alert.svelte'

  export let chat: ChatWithRelations | undefined
  export let message: ChatWithRelations['messages'][number]

  const dispatch = createEventDispatcher()
</script>

<div class="p-4 md:p-8 flex justify-center">
  <div class="max-w-screen-md w-full flex gap-4 md:gap-8">
    <div class="flex-shrink-0 h-10 w-10 text-accent bg-blue-600 rounded-xl overflow-hidden flex">
      <Gravatar value={message.author?.email || chat?.owner.user.email} />
    </div>
    <div class="text-accent prose prose-invert prose-pre:overflow-x-scroll">
      {#await markdownToHtml(message.question) then parsedText}
        {@html parsedText}
      {/await}
    </div>
    <button class="flex-shrink-0 text-white self-start ml-auto" on:click={() => dispatch('delete')}>
      <TrashIcon class="w-5" />
    </button>
  </div>
</div>
<div class="p-4 md:p-8 bg-accent bg-opacity-10 flex justify-center">
  <div class="max-w-screen-md w-full flex gap-4 md:gap-8">
    <div
      class="flex-shrink-0 h-10 w-10 text-accent bg-[#19c37c] rounded-xl flex items-center justify-center"
    >
      <ChatGptIcon />
    </div>
    {#if message?.answer}
      <!-- We need to force prose-invert, which is the dark mode for the prose class due to not having a non dark option -->
      <div class="text-accent prose prose-invert overflow-x-hidden prose-pre:overflow-x-scroll">
        {#await markdownToHtml(message.answer) then parsedText}
          {@html parsedText}
        {/await}
      </div>
    {:else if message?.error}
      <Alert type="error" message={message?.error} />
    {:else}
      <div class="flex items-center justify-center space-x-2">
        <ArrowPathIcon class="h-6 w-6 text-white animate-spin" />
      </div>
    {/if}
  </div>
</div>
