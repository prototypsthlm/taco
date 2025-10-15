<script lang="ts">
  import { enhance } from '$app/forms'
  import Gravatar from '$lib/components/Gravatar.svelte'
  import {
    addFlashNotification,
    flashNotificationStore,
    removeFlashNotificationOfCategory,
  } from '$lib/stores/notification'
  import { EnvelopeIcon, PlusIcon, UserGroupIcon } from '@babeard/svelte-heroicons/solid'
  import type { PageServerData } from './$types'
  import { afterNavigate } from '$app/navigation'
  export let data: PageServerData

  afterNavigate(() => {
    if (
      !data.user.activeUserTeamId &&
      !$flashNotificationStore.find((n) => n.category === 'NO_TEAM')
    ) {
      addFlashNotification('You are not a member of any team', 'Please select or create a team.', {
        type: 'WARNING',
        category: 'NO_TEAM',
      })
    }
  })
</script>

<header
  class="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
>
  <h1 class="text-lg font-semibold leading-7 text-white">Teams</h1>
  <a
    data-testid="new-team-link"
    href="/app/settings/teams/new"
    class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
  >
    <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
    New Team
  </a>
</header>
<!-- Deployment list -->
{#if data?.user?.userTeams && data?.user?.userTeams.length}
  <div class="flex flex-col lg:flex-row justify-between divide-x divide-white/5">
    <ul class="divide-y divide-white/5 grow">
      {#each data?.user?.userTeams as userTeam}
        <li class="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
          <Gravatar class="w-8 h-8 rounded-lg" value={userTeam.team.name} />
          <div class="min-w-0 flex-auto">
            <div class="flex items-center gap-x-3">
              <h2 class="min-w-0 text-sm font-semibold leading-6 text-white">
                <span class="truncate">{userTeam?.team?.name}</span>
              </h2>
            </div>
          </div>
          {#if data?.user.activeUserTeamId !== userTeam?.id}
            <form method="post" action="?/selectTeam" use:enhance>
              <button
                on:click={() => {
                  removeFlashNotificationOfCategory('NO_TEAM')
                }}
                data-testid="select-team-button"
                type="submit"
                class="rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >Select</button
              >
              <input type="hidden" name="userTeamId" value={userTeam.id} />
            </form>
          {:else}
            <span class="text-white opacity-60 text-sm"> (Active team)</span>
          {/if}
          <a href="/app/settings/teams/{userTeam?.team?.id}">
            <button
              type="button"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >Settings</button
            >
          </a>
        </li>
      {/each}
    </ul>
    <slot />
  </div>
{:else}
  <div class="flex flex-col items-center justify-center mt-16 sm:mt-24 md:mt-32">
    <h3 class="text-3xl font-semibold text-neutral-100">You are not a member of any team</h3>

    <div class="flex gap-16 items-center justify-center mt-12">
      <div class="text-center">
        <UserGroupIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-neutral-100">Create a team</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
        <div class="mt-6">
          <a
            href="/app/settings/teams/new"
            class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Team
          </a>
        </div>
      </div>
      <div class="h-32 w-[1px] opacity-30 py-4 bg-neutral-100" />
      <div class="text-center">
        <EnvelopeIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-neutral-100">Get an invitation</h3>
        <p class="mt-1 text-sm text-gray-500">Wait for a team to invite you</p>
        <p class="mt-1 text-sm text-gray-500">or</p>
        <p class="mt-1 text-sm text-gray-500">ask an admin of a team for an invitation.</p>
      </div>
    </div>
  </div>
{/if}
