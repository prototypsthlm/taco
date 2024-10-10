<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import Spinner from '$lib/components/Spinner.svelte'

  export let header: string
  export let description: string
  export let buttonText = 'Save'
  export let form: any
  export let formLoading: boolean = false
</script>

<div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 sm:px-6 lg:px-8 py-16 md:grid-cols-3">
  <div>
    <h2 class="text-base font-semibold leading-7 text-white">{header}</h2>
    <p class="mt-1 text-sm leading-6 text-gray-400">
      {@html description}
    </p>
  </div>

  <div class="md:col-span-2">
    <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
      <slot />
    </div>
    <div class="mt-8 flex gap-4">
      <button
        type="submit"
        disabled={formLoading}
        class="flex rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        {#if formLoading}
          <Spinner />
        {/if}
        <span>{buttonText}</span>
      </button>
      <Alert
        type={(form?.error && 'error') || (form?.success && 'success')}
        title={form?.error || form?.success}
      />
      {#each form?.formErrors || [] as error}
        <Alert type="error" title={error} />
      {/each}
    </div>
  </div>
</div>
