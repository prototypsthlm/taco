<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let temperature: number
  export let loading: boolean
  let value = temperature // Initialize with a default value.
  const changeTemperature = createEventDispatcher() // Used with changeTemperature('changeTemperature', value), where value=[0,2].
</script>

{#if !loading}
  <input
    type="range"
    min="0"
    max="2"
    step="0.1"
    bind:value
    on:input={() => {
      changeTemperature('changeTemperature', value)
    }}
    class={`${$$props.class} fill-current`}
  />
{:else}
  <input
    type="range"
    min="0"
    max="2"
    step="0.1"
    bind:value
    class={`${$$props.class} fill-current`}
    disabled
  />
{/if}

<style>
</style>
