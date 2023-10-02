<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import Alert from '$lib/components/Alert.svelte'
  import Avatar from '$lib/components/Avatar.svelte'
  import Badge from '$lib/components/Badge.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { XMarkIcon } from '@babeard/svelte-heroicons/solid'
  import type { User } from '@prisma/client'

  import { fade } from 'svelte/transition'

  export let chat: UserWithUserTeamsActiveTeamAndChats['sharedChats'][number]['chat']
  export let members: User[]
  export let user: User

  let error: string | undefined
  let errors: Record<string, string[]> = {}

  async function handleUnshare(event: SubmitEvent, memberId: number) {
    event.preventDefault()

    try {
      const response = await fetch(`/api/chats/${chat?.id}/shared-with/${memberId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        error = data?.error
      } else {
        await invalidateAll()
      }
    } catch (e) {
      console.error('Error:', e)
      error = `${e}`
    }
  }
</script>

{#if chat?.sharedWith.length}
  <div transition:fade class="{$$props.class} border-b border-gray-200">
    <ul role="list" class="divide-y divide-gray-200">
      {#each members as member (member.id)}
        <li class="flex py-4">
          <Avatar
            user={member}
            class="inline-block h-10 w-10 rounded-full"
            dotConnectedClass="-bottom-0.5 -left-0.5 h-2.5 w-2.5 bg-green-400 ring ring-white"
            dotDisconnectedClass="bottom-0 left-0 h-1.5 w-1.5 bg-white ring-[2.5px] ring-white ring-offset-2 ring-offset-gray-400"
          />
          <div class="ml-3 flex flex-col">
            <span class="text-sm font-medium text-gray-900"
              >{member.name}
              {#if member.id === user.id}
                <span class="text-sm text-gray-500">(you)</span>
              {/if}</span
            >
            <span class="text-sm text-gray-500">{member.email}</span>
          </div>

          <div class="ml-auto flex items-center">
            <span class="text-sm font-medium text-gray-900">
              <Badge color={member.id === chat?.owner?.userId ? 'purple' : 'green'}>
                {member.id === chat?.owner?.userId ? 'Owner' : 'Member'}
              </Badge>
            </span>
          </div>

          <form class="mx-2 flex items-center" on:submit={(e) => handleUnshare(e, member.id)}>
            <button
              type="submit"
              title={`Unshare${
                member.id === chat?.owner?.userId
                  ? ' (disabled for owner, but owner can delete the chat)'
                  : ''
              }`}
              disabled={member.id === chat?.owner?.userId}
              class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span class="sr-only">Unshare</span>
              <XMarkIcon class="w-5" />
            </button>
          </form>
        </li>
      {/each}
    </ul>
    {#if error}
      <Alert type="error" message={error} />
    {/if}
  </div>
{/if}
