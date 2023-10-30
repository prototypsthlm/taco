<script lang="ts">
  import { Models } from '$lib/types/models'
  import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui'
  import { createPopperActions } from 'svelte-popperjs'
  import { createEventDispatcher } from 'svelte'
  import OptionsIcon from './icons/OptionsIcon.svelte'
  import TemperatureSlider from './TemperatureSlider.svelte'
  import SmallCards from './SmallCards.svelte'

  export let model: string
  export let availableModels: string[]
  export let temperature: number
  export let loading: boolean

  const changeSettings = createEventDispatcher()

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
    <div class="flex justify-centermin-h-[4rem] w-full bg-primary rounded-xl shadow-xl p-2">
      <div class="panel-contents">
        <!-- Model -->
        <SmallCards
          {model}
          {loading}
          {availableModels}
          on:changeModel={(event) => {
            changeSettings('changeModel', event.detail)
          }}
        />

        <div class="mt-4" />

        <!-- Temperature -->
        <div class="flex items-center">
          <div class="max-w-xl text-sm">
            <p>Temperature:</p>
          </div>
          <div class="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
            <TemperatureSlider
              {temperature}
              {loading}
              on:changeTemperature={(event) => {
                changeSettings('changeTemperature', event.detail)
              }}
              class="w-24 accent-indigo-600"
            />
          </div>
        </div>
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
