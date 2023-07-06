<script lang="ts">
  import { getTimeSince } from '$lib/client/utils/timeConverter'
  import { ChatBubbleLeftIcon } from '@babeard/svelte-heroicons/solid'

  export let chatId: number
  export let name: string
  export let roleContent: string
  export let isCurrentPage: boolean
  export let updatedAt: Date

  $: updatedAtShorthand = getTimeSince(updatedAt)
  $: href = `/app/chat/${chatId}`
</script>

<a {href}>
  <li
    class="px-2 py-4 sm:px-4 lg:px-6 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-xl"
    class:bg-accent={isCurrentPage}
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
