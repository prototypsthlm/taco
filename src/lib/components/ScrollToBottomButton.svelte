<script lang="ts">
  import { ArrowDownIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<button
  type="button"
  class="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 {$$props.class}"
  on:click={() => dispatch('click')}
>
  <ArrowDownIcon class="h-5 w-5" aria-hidden="true" />
</button>
