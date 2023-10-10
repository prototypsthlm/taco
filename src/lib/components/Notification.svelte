<script lang="ts">
  import { notificationStore } from '$lib/stores/notification'
  import { CheckCircleIcon } from '@babeard/svelte-heroicons/outline'
  import { XMarkIcon } from '@babeard/svelte-heroicons/solid'
  import { fly } from 'svelte/transition'

  async function markAsRead(id: number) {
    const res = await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
    })
    if (res.ok) {
      notificationStore.update((notifications) => notifications.filter((n) => n.id !== id))
    }
  }
</script>

<div
  aria-live="assertive"
  class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
>
  <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
    {#if $notificationStore?.length}
      {#each $notificationStore as notification (notification.id)}
        <div
          transition:fly={{ x: 400 }}
          class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">{notification.title}</p>
                <p class="mt-1 text-sm text-gray-500">
                  {notification.body}
                </p>
              </div>
              <div class="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  on:click|preventDefault={() => markAsRead(notification.id)}
                >
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
