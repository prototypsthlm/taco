<script lang="ts">
  import { Models } from '$lib/types/models'
  import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui'
  import { createPopperActions } from 'svelte-popperjs'
  import { createEventDispatcher } from 'svelte'
  import OptionsIcon from './icons/OptionsIcon.svelte'

  export let model: string | undefined
  export let loading: boolean

  const toggleModel = createEventDispatcher()

  const [popperRef, popperContent] = createPopperActions()

  // Popper configuration
  const popperOptions = {
    placement: 'bottom-end',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
  }
</script>

<Popover style="position: relative;">
  <!-- Button -->
  <PopoverButton use={[popperRef]} class="rounded-xl bg-primary group">
    <OptionsIcon class="w-8 h-8 text-white opacity-40" />
  </PopoverButton>

  <!-- Panel shown upon pressing button -->
  <PopoverPanel use={[[popperContent, popperOptions]]}>
    <div class="flex justify-centermin-h-[4rem] w-full bg-primary rounded-xl shadow-xl">
      <div class="panel-contents">
        <div class="mt-2 sm:flex sm:items-start sm:justify-between">
          <!-- Model -->
          <div class="max-w-xl text-sm text-gray-500">
            <p>Use chatGPT4</p>
          </div>
          <div class="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
            <button
              on:click={(e) => {
                toggleModel('model', e)
              }}
              disabled={loading}
              type="button"
              class="{model === Models.gpt4
                ? 'bg-indigo-600'
                : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              role="switch"
              aria-checked="false"
              aria-labelledby="renew-subscription-label"
              aria-describedby="renew-subscription-description"
            >
              <span
                aria-hidden="true"
                class="{model === Models.gpt4
                  ? 'translate-x-5'
                  : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              />
            </button>
          </div>
        </div>
        <!-- Temperature -->
        <a>Temperature hervkchbdw</a>
      </div>
    </div>
  </PopoverPanel>
</Popover>

<style>
  .panel-contents {
    display: grid;
    grid-template-columns: repeat(minmax(0, 1fr), 2);
  }
</style>
