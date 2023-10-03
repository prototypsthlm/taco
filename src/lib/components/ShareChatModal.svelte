<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import Alert from '$lib/components/Alert.svelte'
  import ChatMembers from '$lib/components/ChatMembers.svelte'
  import ModalConfirm from '$lib/components/ModalConfirm.svelte'
  import Typeahead from '$lib/components/Typeahead.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { ShareIcon } from '@babeard/svelte-heroicons/solid'
  import type { User } from '@prisma/client'
  import { socketUsersStore } from '$lib/stores/socket'
  import { refreshUsersFromChat } from '$lib/utils/socket'

  export let user: UserWithUserTeamsActiveTeamAndChats
  export let chat: UserWithUserTeamsActiveTeamAndChats['sharedChats'][number]['chat']

  let shareInputValue = ''

  $: teamMates = user?.activeUserTeam?.team?.teamUsers
    ?.filter((x) => x.user.id !== user.id)
    ?.filter((x) => x.user.id !== chat.owner.userId)
    ?.filter((x) => !chat.sharedWith.map((x) => x.user.id).includes(x.user.id))
    .map((x) => ({
      email: x?.user.email,
      name: x?.user.name,
    }))

  let members: User[] = []

  $: if (chat.owner.user || chat.sharedWith.length) {
    members = [chat.owner.user, ...chat.sharedWith.map((u) => u.user)]
  }

  let error: string | undefined
  let errors: Record<string, string[]> = {}

  async function handleShare(event: SubmitEvent) {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)

    try {
      const response = await fetch(`/api/chats/${chat.id}/shared-with`, {
        method: 'PATCH',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        errors = data?.errors
        error = data?.error
      } else {
        shareInputValue = ''
        await invalidateAll()
        const updatedConnectedUsers = refreshUsersFromChat(
          user,
          chat as ChatWithRelations,
          $socketUsersStore
        )

        socketUsersStore.set(updatedConnectedUsers)
      }
    } catch (e) {
      console.error('Error:', e)
      error = `${e}`
    }
  }
</script>

<ModalConfirm>
  <button class="block" type="button" title="Share" slot="trigger">
    <ShareIcon class="h-5 w-5 text-gray-500 hover:text-blue-500 duration-200" />
  </button>
  <svelte:fragment slot="title">Share Chat</svelte:fragment>
  <svelte:fragment slot="body">
    <div class="space-y-2">
      {#if error}
        <Alert type="error" message={error} />
      {/if}
      <form on:submit={handleShare}>
        <div class="space-y-2">
          <label for="add-team-members" class="block text-sm font-medium leading-6 text-gray-900"
            >Add Team Members</label
          >
          <p id="add-team-members-helper" class="sr-only">Enter email address</p>
          <div class="flex">
            <div class="flex-grow">
              <Typeahead
                ariaDescribedby="add-team-members-helper"
                bind:value={shareInputValue}
                id="add-team-members"
                name="email"
                placeholder="Search team members"
                suggestions={teamMates}
                autocomplete="email"
                errors={errors?.email}
              />
            </div>
            <span class="ml-3">
              <button
                type="submit"
                class="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <svg
                  class="-ml-0.5 h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
                  />
                </svg>
                Add
              </button>
            </span>
          </div>
        </div>
        <input type="hidden" name="chatId" value={chat.id} />
      </form>

      {#if error}
        <Alert type="error" message={error} />
      {/if}
      <ChatMembers {chat} {members} {user} />
    </div>
  </svelte:fragment>
  <svelte:fragment slot="confirm">Close</svelte:fragment>
</ModalConfirm>
