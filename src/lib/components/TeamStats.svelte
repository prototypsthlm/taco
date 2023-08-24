<script lang="ts">
  import { enhance } from '$app/forms'
  import { ArrowPathIcon } from '@babeard/svelte-heroicons/solid'

  export let team: any
  export let numberChats: number
  export let form: any | null

  let loadingCost = false
</script>

<div class="bg-gray-900">
  <div class="max-w-6xl">
    <div class="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Number of team users</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white"
            >{team?.teamUsers?.length}</span
          >
        </p>
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Estimated cost</p>
        {#if !form?.estimatedCost}
          {#if !loadingCost}
            <form
              method="post"
              action="?/estimateCost"
              use:enhance={() => {
                loadingCost = true
              }}
              class="pt-3"
            >
              <input type="hidden" name="teamId" value={team.id} />
              <button
                type="submit"
                class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Calculate
              </button>
            </form>
            {:else}
            <ArrowPathIcon class="animate-spin mt-4 h-8 w-8 text-white" />
          {/if}
        {:else}
          <p class="mt-2 flex items-baseline gap-x-2">
            <span class="text-4xl font-semibold tracking-tight text-white">{form?.estimatedCost}</span>
            <span class="text-sm text-gray-400">$</span>
          </p>
        {/if}
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Number of chats</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="text-4xl font-semibold tracking-tight text-white">{numberChats}</span>
        </p>
      </div>
      <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-sm font-medium leading-6 text-gray-400">Team Created At</p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <time
            datetime={team.createdAt?.toISOString()}
            class="text-4xl font-semibold tracking-tight text-white"
            >{team.createdAt?.toLocaleDateString()}</time
          >
        </p>
      </div>
    </div>
  </div>
</div>
