<script lang="ts">
  import type { PageServerData } from './$types'

  export let data: PageServerData
</script>

<header
  class="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
>
  <h1 class="text-base font-semibold leading-7 text-white">Teams</h1>
</header>
<!-- Deployment list -->
{#if data?.user?.userTeams}
  <div class="flex flex-col lg:flex-row justify-between divide-x divide-white/5">
    <ul role="list" class="divide-y divide-white/5 flex-grow">
      {#each [...data?.user?.userTeams, ...data?.user?.userTeams] as userTeam}
        <li class="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
          <div class="min-w-0 flex-auto">
            <div class="flex items-center gap-x-3">
              <div class="flex-none rounded-full p-1 text-gray-500 bg-gray-100/10">
                <div class="h-2 w-2 rounded-full bg-current" />
              </div>
              <h2 class="min-w-0 text-sm font-semibold leading-6 text-white">
                <a href="/app/settings/teams/{userTeam?.team?.id}" class="flex gap-x-2">
                  <span class="truncate">{userTeam?.team?.name}</span>
                </a>
              </h2>
            </div>
          </div>
          <svg
            class="h-5 w-5 flex-none text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </li>
      {/each}
    </ul>
    <slot />
  </div>
{/if}
