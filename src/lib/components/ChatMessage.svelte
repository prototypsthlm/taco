<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import Avatar from '$lib/components/Avatar.svelte'
  import ChatGptIcon from '$lib/components/icons/ChatGptIcon.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { markdownToHtml } from '$lib/utils/markdown.js'
  import { TrashIcon } from '@babeard/svelte-heroicons/outline'
  import { ArrowPathIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher } from 'svelte'

  export let message: ChatWithRelations['messages'][number]
  export let loading: boolean
  export let last = false

  const dispatch = createEventDispatcher()
</script>

<div class="p-4 md:p-8 flex justify-center">
  <div class="max-w-screen-lg w-full flex gap-4 md:gap-8 text-accent">
    <Avatar
      class="w-10 rounded-xl"
      dotConnectedClass="-bottom-0.5 -left-0.5 h-2.5 w-2.5 bg-green-400 ring ring-[#111827]"
      dotDisconnectedClass="bottom-0 left-0 h-1.5 w-1.5 bg-[#111827] ring-[2.5px] ring-[#111827] ring-offset-2 ring-offset-gray-400"
      user={message.author}
    />
    <div class="flex flex-col flex-grow">
      <span class="font-bold">{message.author?.name}</span>
      <div class="prose prose-invert prose-pre:overflow-x-scroll">
        {#await markdownToHtml(message.question) then parsedText}
          {@html parsedText}
        {/await}
      </div>
    </div>
    <button class="text-white self-start" on:click={() => dispatch('delete')}>
      <TrashIcon class="w-5" />
    </button>
  </div>
</div>
<div class="p-4 md:p-8 bg-accent bg-opacity-10 flex justify-center">
  <div class="max-w-screen-lg w-full flex gap-4 md:gap-8 text-accent">
    {#if !message?.answer && (!last || !loading)}
      <Alert class="w-full" title="There was an error generating the response" type="error"
        >You can delete it.</Alert
      >
    {:else}
      <div class="flex-shrink-0 h-10 w-10 bg-[#19c37c] rounded-xl flex items-center justify-center">
        <ChatGptIcon />
      </div>
      <div class="flex flex-col flex-grow">
        <span class="font-bold">{message.model}</span>
        {#if message?.answer}
          <!-- We need to force prose-invert, which is the dark mode for the prose class due to not having a non dark option -->
          <div class="prose prose-invert overflow-x-hidden prose-pre:overflow-x-scroll">
            {#await markdownToHtml(message.answer) then parsedText}
              {@html parsedText}
            {/await}
          </div>
        {:else}
          <div class="flex items-center justify-center space-x-2">
            <ArrowPathIcon class="h-6 w-6 text-white animate-spin" />
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
