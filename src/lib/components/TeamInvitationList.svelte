<script lang="ts">
  import { enhance } from '$app/forms'
  import Alert from '$lib/components/Alert.svelte'
  import {
    CheckIcon,
    PlusIcon,
    TrashIcon,
    ClipboardDocumentIcon,
  } from '@babeard/svelte-heroicons/solid'
  import type { Invitation } from '@prisma/client'
  import { page } from '$app/stores'

  const formatDate = (date: Date) =>
    date.toLocaleString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  export let invitations: Invitation[] = []
  export let isAdmin = false
  export let form: Record<string, string> = {}

  let currentClipboardText = ''

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => (currentClipboardText = text))
      .catch((err) => console.error('Unable to copy text to clipboard.', err))
  }

  function createInvitationUrl(hash: string) {
    return `${$page.url.origin}/invitation/${hash}`
  }
</script>

<div class="px-4 sm:px-6 lg:px-8 max-w-6xl">
  <div class="py-10 flex flex-col gap-4 md:gap-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-white">Invitations</h1>
        <p class="mt-2 text-sm text-gray-300">A list of all open invitations send out to users.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <form
          class="md:place-self-end flex gap-2"
          method="post"
          action="?/createInvitation"
          use:enhance
        >
          <button
            type="submit"
            class="flex gap-1 items-center rounded-md bg-indigo-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Add User
            <PlusIcon class="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
    <Alert
      type={(form?.error && 'error') || (form?.success && 'success')}
      message={form?.error || form?.success}
    />
    {#if invitations.length > 0}
      <ul class="divide-y divide-gray-800">
        {#each invitations as invite}
          <li class="grid grid-cols-1 md:grid-cols-2 gap-y-6 py-5">
            <div class="flex gap-x-4">
              <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibold leading-6 text-white">
                  {invite.hash}
                </p>
                <p class="mt-1 truncate text-xs leading-5 text-gray-400">
                  Invitation created on
                  <time datetime={invite.createdAt.toISOString()}
                    >{formatDate(invite.createdAt)}</time
                  >
                </p>
              </div>
            </div>
            <div class="md:place-self-end flex gap-2">
              <button
                on:click={() => copyToClipboard(createInvitationUrl(invite.hash))}
                class="flex gap-1 items-center rounded-md bg-green-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Copy
                {#if currentClipboardText === createInvitationUrl(invite.hash)}
                  <CheckIcon class="h-4 w-4" />
                {:else}
                  <ClipboardDocumentIcon class="h-4 w-4" />
                {/if}
              </button>
              {#if isAdmin}
                <form method="post" action="?/deleteInvitation" use:enhance>
                  <button
                    on:click={(event) => {
                      if (!confirm(`Are you sure you want to delete the invite ${invite.hash}?`)) {
                        event.preventDefault()
                      }
                    }}
                    type="submit"
                    name="submit"
                    value="remove"
                    class="flex gap-1 items-center rounded-md bg-red-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Delete
                    <TrashIcon class="h-4 w-4" />
                  </button>

                  <input type="hidden" name="invitationId" value={invite.id} />
                </form>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
