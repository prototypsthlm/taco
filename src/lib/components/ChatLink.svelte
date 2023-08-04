<script lang="ts">
  import { isSidebarOpen } from '$lib/stores/general'
  import { getTimeSince } from '$lib/utils/timeConverter'
  import { ChatBubbleLeftIcon, TrashIcon } from '@babeard/svelte-heroicons/solid'
  import { page } from '$app/stores'
  import { enhance } from '$app/forms'

  export let chatId: number
  export let name: string
  export let roleContent: string
  export let updatedAt: Date

  $: updatedAtShorthand = getTimeSince(updatedAt)
  $: href = `/app/chat/${chatId}`
  $: isLinkActive = $page.data.chatId === chatId
</script>

<a href={isLinkActive ? null : href} title={name} on:click={() => isSidebarOpen.set(false)}>
  <li
    class="px-1 py-3 sm:px-4 lg:px-4 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-xl"
    class:bg-accent={isLinkActive}
  >
    <div class="flex items-center gap-x-3">
      <ChatBubbleLeftIcon class="h-6 w-6 text-white flex-none" />
      <h3 class="flex-auto truncate text-sm font-semibold leading-6 text-white">{name}</h3>
      <time datetime={updatedAt.toISOString()} class="flex-none text-xs text-gray-600"
        >{updatedAtShorthand}</time
      >
    </div>
    {#if isLinkActive}
      <div class="flex justify-between items-center gap-2 mt-1">
        <p class="truncate text-sm text-gray-500">
          {roleContent}
        </p>
        <form method="post" action="/app/chat/{chatId}?/deleteChat" use:enhance>
          <button
            type="submit"
            on:click={(event) => {
              if (!confirm(`Are you sure you want to delete the chat "${name}"`)) {
                event.preventDefault()
              }
            }}
          >
            <TrashIcon
              class="h-5 w-5 text-gray-500 hover:text-red-500 duration-200"
            />
          </button>
          <input type="hidden" name="chatId" value={chatId} />
        </form>
      </div>
    {/if}
  </li>
</a>
