<script lang="ts">
  import { isSidebarOpen } from '$lib/stores/general'
  import { getTimeSince } from '$lib/utils/timeConverter'
  import { ChatBubbleLeftIcon } from '@babeard/svelte-heroicons/solid'
  import { page } from '$app/stores'

  export let chatId: number
  export let name: string
  export let roleContent: string
  export let updatedAt: Date

  $: updatedAtShorthand = getTimeSince(updatedAt)
  $: href = `/app/chat/${chatId}`
  $: activeChatId = $page.data.chatId
</script>

<a {href} title={name} on:click={() => isSidebarOpen.set(false)}>
  <li
    class="px-1 py-3 sm:px-4 lg:px-4 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-xl"
    class:bg-accent={activeChatId === chatId}
  >
    <div class="flex items-center gap-x-3">
      <ChatBubbleLeftIcon class="h-6 w-6 text-white flex-none" />
      <h3 class="flex-auto truncate text-sm font-semibold leading-6 text-white">{name}</h3>
      <time datetime={updatedAt.toISOString()} class="flex-none text-xs text-gray-600"
        >{updatedAtShorthand}</time
      >
    </div>
    <p class="mt-2 truncate text-sm text-gray-500">
      {roleContent}
    </p>
  </li>
</a>
