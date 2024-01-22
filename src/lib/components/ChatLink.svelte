<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import AvatarGroup from '$lib/components/AvatarGroup.svelte'
  import DeleteChatModal from '$lib/components/DeleteChatModal.svelte'
  import ModalConfirm from '$lib/components/ModalConfirm.svelte'
  import ShareChatModal from '$lib/components/ShareChatModal.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { isSidebarOpen } from '$lib/stores/general'
  import { getTimeSinceToString } from '$lib/utils/time'
  import {
    ChatBubbleLeftIcon,
    UserGroupIcon,
    Square2StackIcon,
  } from '@babeard/svelte-heroicons/solid'

  export let chat: UserWithUserTeamsActiveTeamAndChats['sharedChats'][number]['chat']
  const name = chat.name || 'New Chat'
  export let user: UserWithUserTeamsActiveTeamAndChats

  $: updatedAtShorthand = getTimeSinceToString(chat.updatedAt)
  $: href = `/app/chats/${chat.id}`
  $: isLinkActive = $page.url.href.endsWith(`/app/chats/${chat.id}`)

  let cloneForm: HTMLFormElement
  let cloneInput: HTMLInputElement
</script>

<a href={isLinkActive ? null : href} title={name} on:click={() => isSidebarOpen.set(false)}>
  <li
    class="p-3 hover:bg-neutral-100 hover:bg-opacity-10 bg-opacity-10 rounded-lg flex flex-col gap-4"
    class:bg-neutral-100={isLinkActive}
  >
    <div class="flex items-center gap-x-3">
      {#if chat.sharedWith.length}
        <div title="Shared">
          <UserGroupIcon class="h-6 w-6 text-white flex-shrink-0" />
        </div>
      {:else}
        <ChatBubbleLeftIcon class="h-6 w-6 text-white flex-shrink-0" />
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
        <ShareChatModal {user} {chat} />
        <ModalConfirm initialFocus={cloneInput} on:confirm={() => cloneForm.requestSubmit()}>
          <button class="block" type="button" title="Clone" slot="trigger">
            <Square2StackIcon class="h-5 w-5 text-gray-500 hover:text-green-500 duration-200" />
          </button>
          <svelte:fragment slot="title">Do you want to clone the chat?</svelte:fragment>
          <svelte:fragment slot="body">
            <form
              method="post"
              action="/app/chats/{chat.id}?/cloneChat"
              bind:this={cloneForm}
              use:enhance
              class="w-full"
            >
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>Choose a name for the new cloned chat.</p>
              </div>
              <div class="mt-5 sm:flex sm:items-center">
                <div class="w-full sm:max-w-xl flex">
                  <label class="sr-only" for="newName">New Name</label>
                  <input
                    bind:this={cloneInput}
                    type="text"
                    name="newName"
                    id="newName"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="A new name for the cloned chat."
                    value={`Cloned: ${name}`}
                  />
                </div>
              </div>
              <input type="hidden" name="chatId" value={chat.id} />
            </form>
          </svelte:fragment>
          <svelte:fragment slot="confirm">Clone</svelte:fragment>
        </ModalConfirm>
        <DeleteChatModal {chat} />
      </div>
      <AvatarGroup />
    {/if}
  </li>
</a>
