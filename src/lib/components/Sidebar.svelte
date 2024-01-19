<script lang="ts">
  import ChatLink from '$lib/components/ChatLink.svelte'
  import Gravatar from '$lib/components/Gravatar.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { isSidebarOpen } from '$lib/stores/general'
  import { ChevronRightIcon, PlusIcon } from '@babeard/svelte-heroicons/solid'

  export let user: UserWithUserTeamsActiveTeamAndChats
  $: chats = [
    ...(user?.sharedChats
      .filter((x) => x.chat.owner.teamId == user.activeUserTeam?.teamId)
      .map((x) => x.chat) || []),
    ...(user.activeUserTeam?.chats || []),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const millisecondsPerSecond = 1000
  const secondsPerMinute = 60
  const minutesPerHour = 60
  const hoursPerDay = 24
  const daysPerWeek = 7

  const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute
  const millisecondsPerHour = millisecondsPerMinute * minutesPerHour
  const millisecondsPerDay = millisecondsPerHour * hoursPerDay
  const millisecondsPerWeek = millisecondsPerDay * daysPerWeek
  const millisecondsPerMonth = millisecondsPerDay * 31 * millisecondsPerDay
  const previousSevenDays = millisecondsPerWeek
  const lastThirtyDays = millisecondsPerDay * 30
  const lastYear = millisecondsPerDay * 365

  let renderedToday = false
  let renderedYesterday = false
  let renderedPreviousSevenDays = false
  let renderedLastThirtyDays = false

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
    } else {
      return false
    }
  }

  const isToday = (date: Date) => {
    const now = new Date()

    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }

  const isYesterday = (date: Date) => {
    const now = new Date()
    const yesterday = new Date(now)

    yesterday.setDate(now.getDate() - 1)

    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  }

  function timeSince(date: Date) {
    const now = new Date()
    return now.getTime() - date.getTime()
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
            {:else if millisecondsPerDay < timeSince(chat.updatedAt) && timeSince(chat.updatedAt) <= previousSevenDays}
              {#if addTitle('previousSevenDays')}
                <p class="flex-none text-xs text-gray-600">Previous 7 Days</p>
              {/if}
              <ChatLink {chat} {user} />
            {:else if previousSevenDays < timeSince(chat.updatedAt) && timeSince(chat.updatedAt) <= lastThirtyDays}
              {#if addTitle('lastThirtyDays')}
                <p class="flex-none text-xs text-gray-600">Previous 30 Days</p>
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
