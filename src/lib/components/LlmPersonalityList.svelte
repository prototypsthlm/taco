<script lang="ts">
  import type { LlmPersonality } from '@prisma/client'
  import Gravatar from './Gravatar.svelte'
  import { TrashIcon } from '@babeard/svelte-heroicons/solid'
  import { enhance } from '$app/forms'
  import PersonalityIcon from './PersonalityIcon.svelte'

  export let personalities: LlmPersonality[]
</script>

<div class="flex flex-col gap-4">
  {#each personalities as personality}
    <div
      class="flex items-center justify-between space-x-3 rounded-lg border border-gray-600 bg-gray-800/40 px-6 py-5 shadow-sm"
    >
      <PersonalityIcon context={personality.context} />
      <div class="min-w-0 flex-1 px-2">
        <p class="text-md font-medium text-gray-100">{personality.name}</p>
        <p class="overflow-hidden text-md text-gray-400">{personality.context}</p>
      </div>
      <form method="post" action="?/deletePersonality" use:enhance>
        <button
          on:click={(event) => {
            if (!confirm(`Are you sure you want to remove this personality?`)) {
              event.preventDefault()
            }
          }}
          type="submit"
          class="flex gap-1 items-center rounded-md bg-red-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Delete
          <TrashIcon class="h-4 w-4" />
        </button>
        <input type="hidden" name="id" value={personality.id} />
      </form>
    </div>
  {/each}
</div>
