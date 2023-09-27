<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import AvatarGroup from '$lib/components/AvatarGroup.svelte'
  import ForkIcon from '$lib/components/icons/ForkIcon.svelte'
  import ModalConfirm from '$lib/components/ModalConfirm.svelte'
  import Typeahead from '$lib/components/Typeahead.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { isSidebarOpen } from '$lib/stores/general'
  import { filterUndefinedOrNull, unique } from '$lib/utils/array'
  import { getTimeSince } from '$lib/utils/timeConverter'
  import {
    ChatBubbleLeftIcon,
    ShareIcon,
    TrashIcon,
    UserGroupIcon,
  } from '@babeard/svelte-heroicons/solid'

  export let chat: UserWithUserTeamsActiveTeamAndChats['sharedChats'][number]['chat']
  const name = chat.name || 'New Chat'
  export let user: UserWithUserTeamsActiveTeamAndChats

  $: updatedAtShorthand = getTimeSince(chat.updatedAt)
  $: href = `/app/chat/${chat.id}`
  $: isLinkActive = $page.data.chatId === chat.id

  let deleteForm: HTMLFormElement
  let forkForm: HTMLFormElement
  let forkInput: HTMLInputElement
  let shareForm: HTMLFormElement
  let shareInput: HTMLInputElement

  $: teamMates = user?.activeUserTeam?.team?.teamUsers
    ?.filter((x) => x.user.id !== user.id)
    ?.filter((x) => !chat.sharedWith.map((x) => x.user.id).includes(x.user.id))
    .map((x) => ({
      email: x?.user.email,
      name: x?.user.name,
    }))
</script>

<a href={isLinkActive ? null : href} title={name} on:click={() => isSidebarOpen.set(false)}>
  <li
    class="px-1 py-3 sm:px-4 lg:px-4 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-xl flex flex-col gap-4"
    class:bg-accent={isLinkActive}
  >
    <div class="flex items-center gap-x-3">
      {#if chat.sharedWith.length}
        <div title="Shared">
          <UserGroupIcon class="h-6 w-6 text-white" />
        </div>
      {:else}
        <ChatBubbleLeftIcon class="h-6 w-6 text-white" />
      {/if}
      <h3 class="flex-auto truncate text-sm font-semibold leading-6 text-white">{name}</h3>
      <time datetime={chat.updatedAt.toISOString()} class="flex-none text-xs text-gray-600"
        >{updatedAtShorthand}</time
      >
    </div>
    {#if isLinkActive}
      <div
        class="flex justify-between items-center gap-2 mt-1"
        on:click|stopPropagation
        on:keyup|stopPropagation
      >
        <p class="truncate text-sm text-gray-500">
          {chat.roleContent}
        </p>
        <ModalConfirm initialFocus={shareInput} on:confirm={() => shareForm.requestSubmit()}>
          <button class="block" type="button" title="Share" slot="trigger">
            <ShareIcon class="h-5 w-5 text-gray-500 hover:text-blue-500 duration-200" />
          </button>
          <svelte:fragment slot="title">Do you want to share the chat?</svelte:fragment>
          <svelte:fragment slot="body">
            <form
              method="post"
              action="/app/chat/{chat.id}?/shareChat"
              bind:this={shareForm}
              use:enhance
              class="w-full"
            >
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>Select the persons to share it with.</p>
              </div>
              <div class="mt-5 sm:flex sm:items-center">
                <div class="w-full sm:max-w-xl flex">
                  <label class="sr-only" for="emails">Emails</label>
                  <Typeahead bind:input={shareInput} name="emails" suggestions={teamMates} />
                </div>
              </div>
              <input type="hidden" name="chatId" value={chat.id} />
            </form>
          </svelte:fragment>
          <svelte:fragment slot="confirm">Share</svelte:fragment>
        </ModalConfirm>
        <ModalConfirm initialFocus={forkInput} on:confirm={() => forkForm.requestSubmit()}>
          <button class="block" type="button" title="Fork it" slot="trigger">
            <ForkIcon class="h-5 w-5 text-gray-500 hover:text-green-500 duration-200" />
          </button>
          <svelte:fragment slot="title">Do you want to fork the chat?</svelte:fragment>
          <svelte:fragment slot="body">
            <form
              method="post"
              action="/app/chat/{chat.id}?/forkChat"
              bind:this={forkForm}
              use:enhance
              class="w-full"
            >
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>Choose a name for the new forked chat.</p>
              </div>
              <div class="mt-5 sm:flex sm:items-center">
                <div class="w-full sm:max-w-xl flex">
                  <label class="sr-only" for="newName">New Name</label>
                  <input
                    bind:this={forkInput}
                    type="text"
                    name="newName"
                    id="newName"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="A new name for the forked chat."
                    value={`Forked: ${name}`}
                  />
                </div>
              </div>
              <input type="hidden" name="chatId" value={chat.id} />
            </form>
          </svelte:fragment>
          <svelte:fragment slot="confirm">Fork</svelte:fragment>
        </ModalConfirm>
        <form
          bind:this={deleteForm}
          method="post"
          action="/app/chat/{chat.id}?/deleteChat"
          use:enhance
        >
          <ModalConfirm type="warning" on:confirm={() => deleteForm.requestSubmit()}>
            <button class="block" type="button" title="Delete it" slot="trigger">
              <TrashIcon class="h-5 w-5 text-gray-500 hover:text-red-500 duration-200" />
            </button>
            <svelte:fragment slot="body">
              Are you sure you want to delete the chat {name}
            </svelte:fragment>
            <svelte:fragment slot="confirm">Delete</svelte:fragment>
          </ModalConfirm>
          <input type="hidden" name="chatId" value={chat.id} />
        </form>
      </div>
      <AvatarGroup />
    {/if}
  </li>
</a>
