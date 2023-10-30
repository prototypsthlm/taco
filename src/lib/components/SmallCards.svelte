<script lang="ts">
  import { Models } from '$lib/types/models'
  import { createEventDispatcher } from 'svelte'

  type MemoryOption = {
    name: string
    inStock: boolean
  }

  const memoryOptions: MemoryOption[] = []
  const allModels: string[] = Object.values(Models)
  export let availableModels: string[]
  for (let i = 0; i < allModels.length; i++) {
    memoryOptions.push({ name: allModels[i], inStock: availableModels?.includes(allModels[i]) })
  }

  export let model: string
  let mem = memoryOptions.find((option) => option.name === model)
  const changeModel = createEventDispatcher()
  export let loading: boolean

  function getClass(option: MemoryOption, active: boolean, checked: boolean) {
    let classes = [
      option.inStock ? 'cursor-pointer focus:outline-none' : 'cursor-not-allowed opacity-25',
      active ? 'ring-2 ring-indigo-600 ring-offset-2' : '',
      checked
        ? 'bg-indigo-600 text-white hover:bg-indigo-500'
        : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
      'flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold uppercase',
    ]
    return classes.join(' ')
  }
</script>

<div role="radiogroup" class="mt-2" aria-label="Choose a memory option">
  <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
    {#each memoryOptions as option, index (index)}
      <div
        role="radio"
        aria-checked={mem === option}
        class={getClass(option, mem === option, option === mem)}
        on:click={() => {
          if (!loading && option.inStock) {
            mem = option
            changeModel('changeModel', option.name)
          }
        }}
        tabindex={option.inStock ? 0 : -1}
      >
        <span>{option.name}</span>
      </div>
    {/each}
  </div>
</div>
