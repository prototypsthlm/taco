<script lang="ts">
  import classNames from 'classnames'
  import { ExclamationCircleIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher } from 'svelte'

  export let name: string
  export let id = name
  export let errors: string[] = []
  export let label = name
  export let placeholder = label
  export let type = 'text'
  export let autocomplete = 'off'
  export let value = ''
  export let disabled = false
  export let input: HTMLInputElement | undefined
  export let noLabel = false

  const dispatch = createEventDispatcher()
</script>

<div class={$$props.class}>
  {#if !noLabel}
    <label for={id} class="mb-2 block text-sm font-medium leading-6 text-gray-900 dark:text-white"
      >{label}</label
    >
  {/if}
  <div class="relative shadow-sm">
    <input
      bind:this={input}
      {id}
      {name}
      {type}
      class={classNames(
        'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset dark:bg-white/5',
        'sm:text-sm sm:leading-6',
        'focus:ring-2 focus:ring-inset',
        'disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-white/7 disabled:text-gray-500 dark:disabled:text-gray-600 disabled:ring-gray-200',
        {
          'text-gray-900 ring-gray-300 dark:text-white dark:ring-white/10 placeholder:text-gray-400 focus:ring-indigo-500':
            !errors?.length,
          'pr-10 text-red-900 dark:text-red-600 ring-red-300 placeholder:text-red-300 focus:ring-red-500':
            errors?.length,
        }
      )}
      {value}
      {placeholder}
      {disabled}
      {autocomplete}
      aria-invalid={!!errors?.length}
      aria-describedby={`${name}-error`}
      on:input={(e) => {
        dispatch('input', e)
      }}
      on:keydown={(e) => {
        errors = []
        dispatch('keydown', e)
      }}
      on:focus={(e) => {
        dispatch('focus', e)
      }}
      on:blur={(e) => {
        dispatch('blur', e)
      }}
    />
    {#if errors?.length}
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ExclamationCircleIcon class="h-5 w-5 text-red-500" aria-hidden="true" />
      </div>
    {/if}
  </div>
  {#if errors?.length}
    {#each errors as error}
      <p class="mt-2 text-sm text-red-600" id={`${name}-error`}>{error}</p>
    {/each}
  {/if}
</div>
