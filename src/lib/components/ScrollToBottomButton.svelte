<script lang="ts">
  import { ArrowDownIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher } from 'svelte'
  import { shouldAutoscroll } from '$lib/stores/scroll'

  const dispatch = createEventDispatcher()

  let bounceClass = ''

  let timeout: NodeJS.Timeout
  shouldAutoscroll.subscribe((value) => {
    if (!value) {
      timeout = setTimeout(() => {
        bounceClass = 'animate-bounce'
      }, 1000)
    } else {
      clearTimeout(timeout)
      bounceClass = ''
    }
  })
</script>

<button
  type="button"
  class="rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 {$$props.class} {bounceClass}"
  on:click={() => dispatch('click')}
>
  <ArrowDownIcon class="h-5 w-5" aria-hidden="true" />
</button>
