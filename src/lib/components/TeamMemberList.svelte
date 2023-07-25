<script lang="ts">
  import {
    ArrowDownIcon,
    ChevronUpIcon,
    PlusIcon,
    TrashIcon,
  } from '@babeard/svelte-heroicons/solid'
  import type { TeamMember } from '../../routes/app/settings/teams/[id]/+page.server'

  import UserProfileAvatar from './UserProfileAvatar.svelte'
  import { enhance } from '$app/forms'
  import Alert from './Alert.svelte'

  function formatDate(date: Date) {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }

    return date.toLocaleString('sv-SE', options)
  }

  export let members: TeamMember[] | undefined
  export let isAdmin: boolean = false
  export let userId: Number
  export let form: Record<string, string> = {}
</script>

{#if members}
  <div class="py-10 flex flex-col gap-4 md:gap-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-white">Users</h1>
        <p class="mt-2 text-sm text-gray-300">
          A list of all the users in this team and their roles.
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
          type="button"
          class="flex gap-1 items-center rounded-md bg-indigo-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Add User
          <PlusIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
    <Alert
      type={(form?.error && 'error') || (form?.success && 'success')}
      message={form?.error || form?.success}
    />
    <ul class="divide-y divide-gray-800">
      {#each members as person}
        <li class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 py-5">
          <div class="flex gap-x-4">
            <UserProfileAvatar
              class="h-12 w-12 flex-none rounded-full bg-gray-800"
              userEmail={person.email}
            />
            <div class="min-w-0 flex-auto">
              <p class="text-sm font-semibold leading-6 text-white">
                {person.name}
                {#if person.id === userId}
                  <span class="font-normal leading-5 text-gray-400">
                    {' '}
                    (you)
                  </span>
                {/if}
              </p>
              <p class="mt-1 truncate text-xs leading-5 text-gray-400">{person.email}</p>
            </div>
          </div>
          <div class="flex flex-col sm:items-center">
            <p class="text-sm leading-6 text-white">{person.role}</p>
            <p class="mt-1 text-xs leading-5 text-gray-400">
              Joined on <time datetime={person.addedAt.toISOString()}
                >{formatDate(person.addedAt)}</time
              >
            </p>
          </div>
          {#if isAdmin && person.id !== userId}
            <form
              class="md:place-self-end flex gap-2"
              method="post"
              action="?/updateUser"
              use:enhance
            >
              <button
                on:click={(event) => {
                  if (!confirm(`Are you sure you want to remove ${person.email} from the team?`)) {
                    event.preventDefault()
                  }
                }}
                type="submit"
                name="submit"
                value="remove"
                class="flex gap-1 items-center rounded-md bg-red-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Remove
                <TrashIcon class="h-4 w-4" />
              </button>

              {#if person.role === 'ADMIN'}
                <button
                  type="submit"
                  name="submit"
                  value="downgrade"
                  class="flex gap-1 items-center rounded-md bg-yellow-600 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-yellow-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Downgrade
                  <ArrowDownIcon class="h-4 w-4" />
                </button>
              {:else}
                <button
                  type="submit"
                  name="submit"
                  value="upgrade"
                  class="flex gap-1 items-center rounded-md bg-green-600 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Upgrade
                  <ChevronUpIcon class="h-4 w-4" />
                </button>
              {/if}

              <input type="hidden" name="userEmail" value={person.email} />
              <input type="hidden" name="userId" value={person.id} />
            </form>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/if}
