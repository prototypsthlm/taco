<script lang="ts">
  import { PlusIcon } from '@babeard/svelte-heroicons/solid'

  import ChatLink from '$lib/components/ChatLink.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import type { Team } from '@prisma/client'

  export let chats: ChatWithRelations[] | null = []
  export let currentChat: ChatWithRelations = null
  export let teams: Team[] = []
</script>

<aside class="w-full">
  {#if chats === null}
    <p class="text-white font-bold text-lg">Select a Team</p>
    <form method="post" action="app?/selectTeam" class="flex flex-col gap-4 py-2">
      {#each teams as team}
        <button
          type="submit"
          name="teamId"
          value={team.id}
          class="text-left p-4 bg-slate-400 bg-opacity-10 hover:bg-opacity-20 rounded-lg"
        >
          <h4 class="text-white font-semibold text-sm">{team.name}</h4>
        </button>
      {/each}
    </form>
  {:else}
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
          isCurrentPage={chat.id === currentChat?.id}
        />
      {/each}
    </ul>
  {/if}
</aside>
