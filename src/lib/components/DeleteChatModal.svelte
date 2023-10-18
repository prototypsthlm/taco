<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import Alert from '$lib/components/Alert.svelte'
  import ModalConfirm from '$lib/components/ModalConfirm.svelte'
  import type { UserWithUserTeamsActiveTeamAndChats } from '$lib/server/entities/user'
  import { socketStore } from '$lib/stores/socket.js'
  import { TrashIcon } from '@babeard/svelte-heroicons/solid'

  export let chat: UserWithUserTeamsActiveTeamAndChats['sharedChats'][number]['chat']

  let errors: string[] = []
  let isOpen = false

  async function deleteChat(id: number) {
    const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' })

    if (res.ok) {
      $socketStore.emit('delete-chat')
      await invalidateAll()
      await goto(`/app`)
      isOpen = false
    } else {
      const data = await res.json()
      errors = data?.errors
      setTimeout(() => {
        errors = []
      }, 5000)
    }
  }
</script>

<ModalConfirm
  type="warning"
  bind:isOpen
  on:confirm={() => {
    errors = []
    deleteChat(chat.id)
  }}
>
  <button
    class="block"
    type="button"
    title="Delete it"
    slot="trigger"
    on:click={() => {
      isOpen = true
    }}
  >
    <TrashIcon class="h-5 w-5 text-gray-500 hover:text-red-500 duration-200" />
  </button>
  <svelte:fragment slot="body">
    Are you sure you want to delete the chat {chat.name ? `"${chat.name}"` : chat.id}
    {#each errors as err}
      <Alert class="mt-4" type="error" message={err} />
    {/each}
  </svelte:fragment>
  <svelte:fragment slot="confirm">Delete</svelte:fragment>
</ModalConfirm>
