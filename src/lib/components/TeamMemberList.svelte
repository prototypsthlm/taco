<script lang="ts">
  import { enhance } from '$app/forms'
  import Alert from '$lib/components/Alert.svelte'
  import Avatar from '$lib/components/Avatar.svelte'
  import { ArrowDownIcon, ChevronUpIcon, TrashIcon } from '@babeard/svelte-heroicons/solid'

  const formatDate = (date: Date) =>
    date.toLocaleString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  export let userTeam: any
  export let team: any
  export let form: Record<string, string> = {}
</script>

<div class="px-4 sm:px-6 lg:px-8 max-w-6xl">
  <div class="py-10 flex flex-col gap-4 md:gap-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-white">Users</h1>
        <p class="mt-2 text-sm text-gray-300">
          A list of all the users in this team and their roles.
        </p>
      </div>
    </div>
    <Alert
      type={(form?.error && 'error') || (form?.success && 'success')}
      title={form?.error || form?.success}
    />
    <ul class="divide-y divide-gray-800">
      {#each team.teamUsers as teamUser}
        <li class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 py-5">
          <div class="flex gap-x-4">
            <Avatar
              class="w-10 rounded-full"
              dotConnectedClass="-bottom-0.5 -left-0.5 h-2.5 w-2.5 bg-green-400 ring ring-gray-900"
              dotDisconnectedClass="bottom-0 left-0 h-1.5 w-1.5 bg-gray-900 ring-[2.5px] ring-gray-900 ring-offset-2 ring-offset-gray-400"
              user={teamUser.user}
            />
            <div class="min-w-0 flex-auto">
              <p class="text-sm font-semibold leading-6 text-white">
                {teamUser.user.name}
                {#if teamUser.user?.id === userTeam.user?.id}
                  <span class="font-normal leading-5 text-gray-400">
                    {' '}
                    (you)
                  </span>
                {/if}
              </p>
              <p class="mt-1 truncate text-xs leading-5 text-gray-400">{teamUser.user.email}</p>
            </div>
          </div>
          <div class="flex flex-col sm:items-center">
            <p class="text-sm leading-6 text-white">{teamUser.role}</p>
            <p class="mt-1 text-xs leading-5 text-gray-400">
              Joined on
              <time datetime={teamUser.createdAt.toISOString()}
                >{formatDate(teamUser.createdAt)}</time
              >
            </p>
          </div>
          {#if userTeam.role !== 'MEMBER' && userTeam.user?.id !== teamUser.user?.id}
            <form
              class="md:place-self-end flex gap-2"
              method="post"
              action="?/updateUser"
              use:enhance
            >
              <button
                on:click={(event) => {
                  if (
                    !confirm(
                      `Are you sure you want to remove ${teamUser.user.email} from the team?`
                    )
                  ) {
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

              {#if teamUser.role === 'ADMIN'}
                <button
                  type="submit"
                  name="submit"
                  value="downgrade"
                  class="flex gap-1 items-center rounded-md bg-yellow-600 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-yellow-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Downgrade
                  <ArrowDownIcon class="h-4 w-4" />
                </button>
              {:else if teamUser.role === 'MEMBER'}
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

              <input type="hidden" name="userEmail" value={teamUser.user.email} />
              <input type="hidden" name="userId" value={teamUser.user?.id} />
              <input type="hidden" name="userTeamId" value={teamUser?.id} />
            </form>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>
