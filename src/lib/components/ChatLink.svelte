<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import ForkIcon from '$lib/components/icons/ForkIcon.svelte'
  import ModalConfirm from '$lib/components/ModalConfirm.svelte'
  import { isSidebarOpen } from '$lib/stores/general'
  import { getTimeSince } from '$lib/utils/timeConverter'
  import { ChatBubbleLeftIcon, TrashIcon } from '@babeard/svelte-heroicons/solid'

  export let chatId: number
  export let name: string
  export let roleContent: string
  export let updatedAt: Date

  $: updatedAtShorthand = getTimeSince(updatedAt)
  $: href = `/app/chat/${chatId}`
  $: isLinkActive = $page.data.chatId === chatId

  let deleteForm: HTMLFormElement
  let forkForm: HTMLFormElement
</script>

<a href={isLinkActive ? null : href} title={name} on:click={() => isSidebarOpen.set(false)}>
  <li
    class="px-1 py-3 sm:px-4 lg:px-4 hover:bg-accent hover:bg-opacity-10 bg-opacity-10 rounded-xl"
    class:bg-accent={isLinkActive}
  >
    <div class="flex items-center gap-x-3">
      <ChatBubbleLeftIcon class="h-6 w-6 text-white flex-none" />
      <h3 class="flex-auto truncate text-sm font-semibold leading-6 text-white">{name}</h3>
      <time datetime={updatedAt.toISOString()} class="flex-none text-xs text-gray-600"
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
          {roleContent}
        </p>
        <ModalConfirm on:confirm={() => forkForm.requestSubmit()}>
          <button type="button" slot="trigger">
            <ForkIcon class="h-5 w-5 text-gray-500 hover:text-green-500 duration-200" />
          </button>
          <svelte:fragment slot="title">Do you want to fork the chat?</svelte:fragment>
          <svelte:fragment slot="body">
            <form
              method="post"
              action="/app/chat/{chatId}?/forkChat"
              bind:this={forkForm}
              use:enhance
            >
              <div class="mt-2 max-w-xl text-sm text-gray-500">
                <p>Choose a name for the new forked chat.</p>
              </div>
              <div class="mt-5 sm:flex sm:items-center">
                <div class="w-full sm:max-w-xs flex">
                  <label for="newName">New Name</label>
                  <input
                    type="text"
                    name="newName"
                    id="newName"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="A new name for the forked chat."
                    value={`Forked: ${name}`}
                  />
                </div>
              </div>
              <input type="hidden" name="chatId" value={chatId} />
            </form>
          </svelte:fragment>
          <svelte:fragment slot="confirm">Fork</svelte:fragment>
        </ModalConfirm>
        <form
          bind:this={deleteForm}
          method="post"
          action="/app/chat/{chatId}?/deleteChat"
          use:enhance
        >
          <ModalConfirm type="warning" on:confirm={() => deleteForm.requestSubmit()}>
            <button type="button" title="Delete it!" slot="trigger">
              <TrashIcon class="h-5 w-5 text-gray-500 hover:text-red-500 duration-200" />
            </button>
            <svelte:fragment slot="body">
              Are you sure you want to delete the chat {name}
            </svelte:fragment>
            <svelte:fragment slot="confirm">Delete</svelte:fragment>
          </ModalConfirm>
          <input type="hidden" name="chatId" value={chatId} />
        </form>
      </div>
    {/if}
  </li>
</a>
