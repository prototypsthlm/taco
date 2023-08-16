<script lang="ts">
  import { page } from '$app/stores'
  import ChatLink from '$lib/components/ChatLink.svelte'
  import Gravatar from '$lib/components/Gravatar.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { resetToNewChat } from '$lib/stores/chat'
  import { PlusIcon } from '@babeard/svelte-heroicons/solid'
  import ChevronRight from '@babeard/svelte-heroicons/solid/ChevronRight'

  export let user: UserWithUserTeamsActiveTeamAndChats
</script>

<aside class="flex flex-col grow overflow-hidden">
  {#if user.activeUserTeam}
    <a href="/app/settings/teams" class="flex justify-between items-center pb-6 w-full">
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
        on:click={() => {
          if ($page.route.id === '/app') $resetToNewChat = true
        }}
        class="mb-2 px-2 py-4 sm:px-4 lg:px-6 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-xl border-2 border-white border-opacity-20"
      >
        <div class="flex items-center gap-x-3">
          <PlusIcon class="h-6 w-6 text-white flex-none" />
          <h3 class="flex-auto truncate text-md font-semibold leading-6 text-white">New Chat</h3>
        </div>
      </a>
      <ul class="overflow-scroll grow flex flex-col gap-2 pt-4">
        {#each user.activeUserTeam.chats as chat}
          <ChatLink
            chatId={chat.id}
            name={chat.name || 'New Chat'}
            updatedAt={chat.updatedAt}
            roleContent={chat.roleContent}
          />
        {/each}
      </ul>
    {/if}
  {:else}
    <p class="text-white mt-4 text-opacity-60 text-center">No team selected</p>
  {/if}
</aside>
