<script lang="ts">
  import type { PageServerData } from './$types'
  import { ChevronRightIcon } from '@babeard/svelte-heroicons/solid'

  export let data: PageServerData
</script>

<header
  class="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
>
  <h1 class="text-lg font-semibold leading-7 text-white">Teams</h1>
</header>
<!-- Deployment list -->
{#if data?.user?.userTeams}
  <div class="flex flex-col lg:flex-row justify-between divide-x divide-white/5">
    <ul class="divide-y divide-white/5 grow">
      {#each data?.user?.userTeams as userTeam}
        <a href="/app/settings/teams/{userTeam?.team?.id}">
          <li class="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
            <div class="min-w-0 flex-auto">
              <div class="flex items-center gap-x-3">
                <h2 class="min-w-0 text-sm font-semibold leading-6 text-white">
                  <span class="truncate">{userTeam?.team?.name}</span>
                </h2>
              </div>
            </div>
            <ChevronRightIcon class="w-4 flex-none text-gray-400" />
          </li>
        </a>
      {/each}
    </ul>
    <slot />
  </div>
{/if}
