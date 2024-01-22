<script lang="ts">
  import ChatLink from '$lib/components/ChatLink.svelte'
  import Gravatar from '$lib/components/Gravatar.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { isSidebarOpen } from '$lib/stores/general'
  import { ChevronRightIcon, PlusIcon } from '@babeard/svelte-heroicons/solid'
  import {
    getTimeSince,
    isToday,
    isLastYear,
    isYesterday,
    millisecondsPerDay,
    previousSevenDays,
    lastThirtyDays,
    lastYear,
  } from '$lib/utils/time'

  export let user: UserWithUserTeamsActiveTeamAndChats
  $: chats = [
    ...(user?.sharedChats
      .filter((x) => x.chat.owner.teamId == user.activeUserTeam?.teamId)
      .map((x) => x.chat) || []),
    ...(user.activeUserTeam?.chats || []),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  let renderedToday = false
  let renderedYesterday = false
  let renderedPreviousSevenDays = false
  let renderedLastThirtyDays = false
  let renderedLastYear = false

  function addTitle(name: string) {
    if (name === 'today' && renderedToday === false) {
      renderedToday = true
      return true
    } else if (name == 'yesterday' && renderedYesterday === false) {
      renderedYesterday = true
      return true
    } else if (name == 'previousSevenDays' && renderedPreviousSevenDays === false) {
      renderedPreviousSevenDays = true
      return true
    } else if (name == 'lastThirtyDays' && renderedLastThirtyDays === false) {
      renderedLastThirtyDays = true
      return true
    } else if (name == 'lastYear' && renderedLastYear === false) {
      renderedLastThirtyDays = true
      return true
    } else {
      return false
    }
  }
</script>

<aside class="flex flex-col grow overflow-hidden h-full">
  {#if user.activeUserTeam}
    <a href="/app/settings/teams" class="flex justify-between items-center w-full">
      <div class="flex gap-2 items-center">
        <Gravatar class="w-8 h-8 rounded-lg" value={user.activeUserTeam.team?.name} />
        <div class="flex flex-col items-start leading-none">
          <p class="text-gray-400 text-opacity-60 text-xs">Selected Team</p>
          <p class="text-white">{user.activeUserTeam.team?.name}</p>
        </div>
      </div>
      <ChevronRightIcon class="h-4 w-4 text-white" />
    </a>
    {#if user?.activeUserTeam}
      <a
        href="/app"
        class="mt-6 px-2 py-4 sm:px-4 lg:px-6 hover:bg-neutral-100 hover:bg-opacity-10 bg-opacity-10 rounded-lg border-2 border-white border-opacity-20 flex items-center gap-x-3"
        on:click={() => isSidebarOpen.set(false)}
      >
        <PlusIcon class="h-6 w-6 text-white flex-none" />
        <h3 class="flex-auto truncate text-lg font-semibold leading-6 text-white">New Chat</h3>
      </a>
      {#if chats.length}
        <ul class="overflow-auto grow flex flex-col gap-2 pt-2">
          {#each chats as chat (chat.id)}
            {#if isToday(chat.updatedAt)}
              {#if addTitle('today')}
                <p class="flex-none text-xs text-gray-600">Today</p>
              {/if}
              <ChatLink {chat} {user} />
            {:else if isYesterday(chat.updatedAt)}
              {#if addTitle('yesterday')}
                <p class="flex-none text-xs text-gray-600">Yesterday</p>
              {/if}
              <ChatLink {chat} {user} />
            {:else if millisecondsPerDay < getTimeSince(chat.updatedAt) && getTimeSince(chat.updatedAt) <= previousSevenDays}
              {#if addTitle('previousSevenDays')}
                <p class="flex-none text-xs text-gray-600">Previous 7 Days</p>
              {/if}
              <ChatLink {chat} {user} />
            {:else if previousSevenDays < getTimeSince(chat.updatedAt) && getTimeSince(chat.updatedAt) <= lastThirtyDays}
              {#if addTitle('lastThirtyDays')}
                <p class="flex-none text-xs text-gray-600">Previous 30 Days</p>
              {/if}
              <ChatLink {chat} {user} />
            {:else if isLastYear(chat.updatedAt)}
              {#if addTitle('lastYear')}
                <p class="flex-none text-xs text-gray-600">{lastYear}</p>
              {/if}
              <ChatLink {chat} {user} />
            {/if}
          {/each}
        </ul>
      {/if}
    {/if}
  {:else}
    <p class="text-white mt-4 text-opacity-60 text-center">No team selected</p>
  {/if}
</aside>
