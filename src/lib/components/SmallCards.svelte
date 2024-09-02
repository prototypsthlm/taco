<script lang="ts">
  import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@rgossiaux/svelte-headlessui'

  export let options: {
    value: string
    label: string
    enabled: boolean
  }[] = []

  export let value: string
  export let heading: string
  export let groupLabel: string
  export let loading: boolean
</script>

<div class={$$props.class}>
  <div class="flex items-center justify-between p-1">
    <h2 class="text-sm font-medium leading-6 text-gray-900">{heading}</h2>
  </div>

  <RadioGroup bind:value class="mt-2">
    <RadioGroupLabel class="sr-only">{groupLabel}</RadioGroupLabel>
    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4 w-max">
      {#each options as option}
        <RadioGroupOption
          bind:value={option.value}
          disabled={!option.enabled || loading}
          let:active
          let:checked
        >
          <div
            class="{option.enabled && !loading
              ? 'cursor-pointer focus:outline-none'
              : 'cursor-not-allowed opacity-25'} {active &&
              'ring-2 ring-indigo-600 ring-offset-2'}, {checked
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
              : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:ring-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'} flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold uppercase flex-1"
          >
            <RadioGroupLabel
              class="flex whitespace-nowrap"
              as="span"
              title={!option.enabled ? 'Disabled' : 'Enabled'}>{option.label}</RadioGroupLabel
            >
          </div>
        </RadioGroupOption>
      {/each}
    </div>
  </RadioGroup>
</div>
