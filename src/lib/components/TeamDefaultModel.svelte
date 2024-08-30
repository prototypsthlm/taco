<script lang="ts">
  import { enhance } from '$app/forms'
  import SmallCards from '$lib/components/SmallCards.svelte'
  import type { Model } from '$lib/server/api/openai'
  import Alert from './Alert.svelte'

  export let models: Model[]
  export let model: string
  export let form: Record<string, string> = {}
</script>

<div class="px-4 sm:px-6 lg:px-8 max-w-6xl py-10">
  <div class="sm:flex-auto">
    <h1 class="text-base font-semibold leading-6 text-white">Default model</h1>
    <p class="mt-2 text-sm text-gray-300">
      The model used per default when a member of your team starts a new chat.
    </p>
  </div>
  <form method="post" action="?/updateTeamModel" use:enhance>
    <SmallCards
      loading={false}
      bind:value={model}
      options={models.map((x) => ({ value: x.id, label: x.label, enabled: x.enabled }))}
      heading="Model"
      groupLabel="Choose a model option"
      class="mb-4"
    />
    <input type="hidden" name="model" value={model} />
    <div class="flex gap-4">
      <button
        type="submit"
        class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >Save</button
      >
      <Alert
        type={(form?.error && 'error') || (form?.success && 'success') || 'warning'}
        title={form?.error || form?.success}
      />
    </div>
  </form>
</div>
