<script lang="ts">
  import { Models } from '$lib/types/models'
  import SmallCards from '$lib/components/SmallCards.svelte'
  import type { Model } from '$lib/server/api/openai'

  export let models: Model[]
  let model = Models.gpt3
</script>

<div class="px-4 sm:px-6 lg:px-8 max-w-6xl py-10">
  <div class="sm:flex-auto">
    <h1 class="text-base font-semibold leading-6 text-white">Default model</h1>
    <p class="mt-2 text-sm text-gray-300">The model used per default when starting a new chat.</p>
  </div>
  <SmallCards
    loading={false}
    bind:value={model}
    options={models.map((x) => ({ value: x.id, label: x.label, enabled: x.enabled }))}
    heading="Model"
    groupLabel="Choose a model option"
    class="mb-4"
  />
</div>
