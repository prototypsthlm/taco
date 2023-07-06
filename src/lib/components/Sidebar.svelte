<script lang="ts">
  import { PlusIcon } from '@babeard/svelte-heroicons/solid'

  import { page } from '$app/stores'
  import ChatLink from '$lib/components/ChatLink.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'

  export let chats: ChatWithRelations[] = []
</script>

<aside class="w-full">
  <ul class="flex flex-col gap-4">
    <a
      href="/app"
      class="px-2 py-4 sm:px-4 lg:px-6 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-xl"
    >
      <div class="flex items-center gap-x-3">
        <PlusIcon class="h-6 w-6 text-white flex-none" />
        <h3 class="flex-auto truncate text-md font-semibold leading-6 text-white">New Chat</h3>
      </div>
    </a>
    <hr class="w-full border-white/20" />
    {#each chats as chat}
      <ChatLink
        chatId={chat.id}
        name={chat.name || 'New Chat'}
        updatedAt={chat.updatedAt}
        roleContent={chat.roleContent}
        isCurrentPage={$page.url.pathname === `/app/chat/${chat.id}`}
      />
    {/each}
  </ul>
</aside>
