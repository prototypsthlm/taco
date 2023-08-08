<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import ChatLink from '$lib/components/ChatLink.svelte'
  import Gravatar from '$lib/components/Gravatar.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { resetToNewChat } from '$lib/stores/chat'
  import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from '@babeard/svelte-heroicons/solid'

  export let user: UserWithUserTeamsActiveTeamAndChats

  let selectTeamView = false
</script>

<aside class="flex flex-col grow overflow-hidden">
  {#if user.activeUserTeam}
    <button
      on:click={() => (selectTeamView = !selectTeamView)}
      class="flex justify-between items-center pb-6 w-full"
    >
      <div class="flex gap-2 items-center">
        <Gravatar class="w-8 h-8 rounded-lg" value={user.activeUserTeam.team?.name} />
        <div class="flex flex-col items-start leading-none">
          <p class="text-gray-400 text-opacity-60 text-xs">Selected Team</p>
          <p class="text-white">{user.activeUserTeam.team?.name}</p>
        </div>
      </div>
      {#if !selectTeamView}
        <ChevronDownIcon class="h-4 w-4 text-white" />
      {:else}
        <ChevronUpIcon class="h-4 w-4 text-white" />
      {/if}
    </button>
  {/if}

  {#if !user?.activeUserTeam?.chats || selectTeamView}
    <div class="pt-2">
      <p class="text-white text-center font-bold text-lg">Select a Team</p>
      <form
        method="post"
        use:enhance
        action="/app?/selectTeam"
        class="flex flex-col gap-4 py-2"
        on:submit={() => (selectTeamView = !selectTeamView)}
      >
        {#each user.userTeams as userTeam}
          <button
            type="submit"
            name="userTeamId"
            value={userTeam.id}
            disabled={userTeam.id === user.activeUserTeam?.id}
            class="text-left p-4 bg-slate-400 bg-opacity-10 hover:bg-opacity-20 rounded-lg"
          >
            <h4 class="text-white font-semibold text-sm">
              {userTeam.team?.name}
              {#if userTeam.id === user.activeUserTeam?.id}
                <span class="text-xs text-gray-400 text-opacity-60"> (current)</span>
              {/if}
            </h4>
          </button>
        {/each}
      </form>
    </div>
  {:else}
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
</aside>
