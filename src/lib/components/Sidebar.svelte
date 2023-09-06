<script lang="ts">
  import ChatLink from '$lib/components/ChatLink.svelte'
  import Gravatar from '$lib/components/Gravatar.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { isSidebarOpen } from '$lib/stores/general'
  import { PlusIcon } from '@babeard/svelte-heroicons/solid'
  import ChevronRight from '@babeard/svelte-heroicons/solid/ChevronRight'

  export let user: UserWithUserTeamsActiveTeamAndChats
</script>

<aside class="flex flex-col grow overflow-hidden h-full">
  {#if user.activeUserTeam}
    <a href="/app/settings/teams" class="flex justify-between items-center pb-6 px-2 w-full">
      <div class="flex gap-2 items-center">
        <Gravatar class="w-8 h-8 rounded-lg" value={user.activeUserTeam.team?.name} />
        <div class="flex flex-col items-start leading-none">
          <p class="text-gray-400 text-opacity-60 text-xs">Selected Team</p>
          <p class="text-white">{user.activeUserTeam.team?.name}</p>
        </div>
      </div>
      <ChevronRight class="h-4 w-4 text-white" />
    </a>
    {#if user?.activeUserTeam?.chats?.length}
      <a
        href="/app"
        class="mb-2 px-2 py-4 sm:px-4 lg:px-6 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-lg border-2 border-white border-opacity-20 flex items-center gap-x-3"
        on:click={() => isSidebarOpen.set(false)}
      >
        <PlusIcon class="h-6 w-6 text-white flex-none" />
        <h3 class="flex-auto truncate text-lg font-semibold leading-6 text-white">New Chat</h3>
      </a>
      <ul class="overflow-scroll grow flex flex-col gap-2 pt-4">
        {#each user.activeUserTeam.chats as chat}
          <ChatLink
            chatId={chat.id}
            name={chat.name || 'New Chat'}
            updatedAt={chat.updatedAt}
            roleContent={chat.roleContent}
            {user}
          />
        {/each}
      </ul>
    {/if}
  {:else}
    <p class="text-white mt-4 text-opacity-60 text-center">No team selected</p>
  {/if}
</aside>
