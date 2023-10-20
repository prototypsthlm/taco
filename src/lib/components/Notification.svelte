<script lang="ts">
  import {
    type FlashNotification,
    flashNotificationStore,
    notificationStore,
  } from '$lib/stores/notification'
  import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon,
  } from '@babeard/svelte-heroicons/outline'
  import type { Notification } from '@prisma/client'
  import { flip } from 'svelte/animate'
  import { fly } from 'svelte/transition'

  function isPersistedNotification(n: Notification | FlashNotification): n is Notification {
    return 'read' in n
  }

  function handleDismiss(n: Notification | FlashNotification) {
    if (isPersistedNotification(n)) {
      markAsReadNotification(n)
    } else {
      removeFlashNotification(n)
    }
  }

  async function markAsReadNotification(notif: Notification) {
    const res = await fetch(`/api/notifications/${notif.id}`, {
      method: 'PATCH',
    })

    if (!res.ok) {
      console.error('Failed to mark notification as read')
      return
    }
    notificationStore.update((nts) =>
      nts.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    )
  }

  function removeFlashNotification(notification: FlashNotification) {
    flashNotificationStore.update((ns) => ns.filter((n) => n.id !== notification.id))
  }
</script>

<div
  aria-live="assertive"
  class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
>
  <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
    {#each [...$notificationStore, ...$flashNotificationStore] as n (n.id)}
      <div
        class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
        transition:fly={{ x: 400 }}
        animate:flip={{ duration: 300 }}
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              {#if n.type === 'SUCCESS'}
                <CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />
              {:else if n.type === 'WARNING'}
                <ExclamationTriangleIcon class="h-6 w-6 text-yellow-400" aria-hidden="true" />
              {:else if n.type === 'ERROR'}
                <XCircleIcon class="h-6 w-6 text-red-400" aria-hidden="true" />
              {:else}
                <InformationCircleIcon class="h-6 w-6 text-blue-400" aria-hidden="true" />
              {/if}
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">{n.title}</p>
              <p class="mt-1 text-sm text-gray-500">
                {n.body}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                on:click={() => handleDismiss(n)}
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
