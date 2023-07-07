<script lang="ts">
  import type { TeamMember } from '../../routes/app/settings/teams/[id]/+page.server'
  import { Menu, MenuButton, MenuItem, MenuItems } from '@rgossiaux/svelte-headlessui'

  import UserProfileAvatar from './UserProfileAvatar.svelte'
  import { EnvelopeIcon, PhoneIcon } from '@babeard/svelte-heroicons/solid'

  export let members: TeamMember[]
</script>

{#if members}
  <ul class="divide-y divide-gray-800">
    {#each members as person}
      <li class="flex justify-between gap-x-6 py-5">
        <div class="flex gap-x-4">
          <UserProfileAvatar
            class="h-12 w-12 flex-none rounded-full bg-gray-800"
            userEmail={person.email}
          />
          <div class="min-w-0 flex-auto">
            <p class="text-sm font-semibold leading-6 text-white">{person.name}</p>
            <p class="mt-1 truncate text-xs leading-5 text-gray-400">{person.email}</p>
          </div>
        </div>
        <div class="hidden sm:flex sm:flex-col sm:items-end">
          <p class="text-sm leading-6 text-white">{person.role}</p>
          <p class="mt-1 text-xs leading-5 text-gray-400">
            Added to team <time datetime={person.addedAt.toISOString()}
              >{person.addedAt.toLocaleTimeString()}</time
            >
          </p>
        </div>
      </li>
    {/each}
  </ul>
{/if}
