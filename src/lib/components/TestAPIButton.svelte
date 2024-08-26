<script lang="ts">
  import { testOpenAiAPIKey } from '$lib/utils/testOpenAiAPIKey'

  let isLoading: boolean = false
  let message: string = ''

  export let testApiKey: string
  async function handleClick() {
    isLoading = true
    message = await testOpenAiAPIKey(testApiKey)
    isLoading = false
  }
</script>

<div class="flex gap-6 items-center {$$props.class}">
  <button
    on:click={handleClick}
    type="button"
    disabled={isLoading}
    class="flex rounded-md bg-indigo-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:bg-indigo-300"
  >
    {#if isLoading}
      <svg
        class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Testing
    {:else}
      Test Key
    {/if}
  </button>
  <div class="text-gray-400 text-sm">{message}</div>
</div>
