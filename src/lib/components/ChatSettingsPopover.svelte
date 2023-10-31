<script lang="ts">
  import SmallCards from '$lib/components/SmallCards.svelte'
  import type { Model } from '$lib/server/api/openai'
  import { EllipsisVerticalIcon } from '@babeard/svelte-heroicons/solid'
  import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui'
  import { fade } from 'svelte/transition'
  import classNames from 'classnames'

  export let model: string
  export let models: Model[]
  export let temperature: number
  export let loading: boolean
</script>

<Popover let:open class="relative flex {$$props.class}">
  <PopoverButton
    class="inline-flex items-center rounded-lg bg-neutral-500 p-2 text-neutral-100 shadow-sm hover:bg-neutral-100 hover:text-neutral-500"
  >
    <span class="absolute -inset-1" />
    <span class="sr-only">Open options menu</span>
    <EllipsisVerticalIcon class="w-6" aria-hidden="true" />
  </PopoverButton>

  {#if open}
    <div transition:fade={{ duration: 100 }}>
      <PopoverPanel class="absolute bottom-16 right-0">
        <div class="flex flex-col justify-center bg-white rounded-xl shadow-xl p-4">
          <SmallCards
            {loading}
            bind:value={model}
            options={models.map((x) => ({ value: x.id, label: x.label, enabled: x.enabled }))}
            heading="Model"
            groupLabel="Choose a model option"
            class="mb-4"
          />

          <div class="border-t border-gray-100 mt-4">
            <div class="mt-4 flex items-center gap-2">
              <h2 class="text-sm font-medium leading-6 text-neutral-900">Temperature</h2>
              <input
                type="number"
                class={classNames(
                  'text-sm font-medium border-none text-neutral-50 bg-neutral-400 py-1 px-1.5 rounded-md w-16',
                  'focus:ring-0 focus:outline-none',
                  'invalid:ring focus:invalid:ring invalid:ring-red-400'
                )}
                bind:value={temperature}
                disabled={loading}
                min="0.1"
                max="2"
                step="0.1"
              />
              <span class="italic text-neutral-300 text-xs ml-auto">Recommended 0.6</span>
            </div>
            <input
              disabled={loading}
              type="range"
              min="0"
              max="2"
              step="0.1"
              bind:value={temperature}
              class="mt-4 w-full accent-indigo-600"
            />
          </div>
        </div>
      </PopoverPanel>
    </div>
  {/if}
</Popover>
