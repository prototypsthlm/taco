<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import Avatar from '$lib/components/Avatar.svelte'
  import ChatGptIcon from '$lib/components/icons/ChatGptIcon.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { TrashIcon } from '@babeard/svelte-heroicons/outline'
  import { ArrowPathIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher } from 'svelte'
  import Markdown from '@magidoc/plugin-svelte-marked'
  import CodeBlock from './CodeBlock.svelte'

  export let message: ChatWithRelations['messages'][number]
  export let loading: boolean
  export let last = false
  export let isDeleting = false

  const dispatch = createEventDispatcher()

  const renderers = {
    code: CodeBlock,
  }
</script>

<div class="p-4 md:p-8 flex justify-center max-w-full">
  <div class="relative max-w-screen-lg w-full flex justify-end gap-4 md:gap-8 text-neutral-100">
    <div class="max-w-xl w-full ml-auto flex flex-col flex-grow overflow-x-auto">
      <span class="font-bold text-right my-2">{message.author?.name}</span>
      <div class="flex gap-3 items-start justify-end">
        <button disabled={isDeleting} class="text-white mt-2" on:click={() => dispatch('delete')}>
          <TrashIcon class="w-5" />
        </button>
        <div
          class="prose prose-invert overflow-x-hidden prose-pre:overflow-x-auto bg-neutral-100 bg-opacity-10 rounded-lg px-4 py-3"
        >
          <Markdown source={message.question} />
        </div>
      </div>
    </div>
    <Avatar
      transition={false}
      class="w-10 rounded-xl"
      dotConnectedClass="-bottom-0.5 -left-0.5 h-2.5 w-2.5 bg-green-400 ring ring-gray-900"
      dotDisconnectedClass="bottom-0 left-0 h-1.5 w-1.5 bg-gray-900 ring-[2.5px] ring-gray-900 ring-offset-2 ring-offset-gray-400"
      user={message.author}
    />
  </div>
</div>
<div class="p-4 md:p-8 flex justify-center">
  <div class="max-w-screen-lg w-full flex gap-4 md:gap-8 text-neutral-100">
    {#if !message?.answer && (!last || !loading)}
      <Alert class="w-full" title="There was an error generating the response" type="error"
        >You can delete it.</Alert
      >
    {:else}
      <div class="flex-shrink-0 h-10 w-10 bg-[#19c37c] rounded-xl flex items-center justify-center">
        <ChatGptIcon />
      </div>
      <div class="flex flex-col flex-grow overflow-x-auto">
        <span class="font-bold">{message.model}</span>
        {#if message?.answer}
          <!-- We need to force prose-invert, which is the dark mode for the prose class due to not having a non dark option -->
          <div class="max-w-[825px] prose prose-invert overflow-x-hidden prose-pre:overflow-x-auto">
            <Markdown source={message.answer} {renderers} />
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
