<script lang="ts">
  import classNames from 'classnames'
  import { Icon, ExclamationCircle } from 'svelte-hero-icons'

  export let name: string
  export let id = name
  export let errors: string[] = []
  export let label = name
  export let placeholder = label
  export let type = 'text'
  export let autocomplete = 'off'
  export let value = ''
  export let disabled = false
</script>

<div class={$$props.class}>
  <label for={id} class="block text-sm font-medium leading-6 text-white">{label}</label>
  <div class="relative mt-2 shadow-sm">
    <input
      {id}
      {name}
      {type}
      class={classNames(
        'block w-full border-0 py-1.5 shadow-sm ring-1 ring-inset bg-white/5',
        'sm:text-sm sm:leading-6',
        'focus:ring-2 focus:ring-inset',
        'disabled:cursor-not-allowed disabled:bg-white/7 disabled:text-gray-600 disabled:ring-gray-200',
        {
          'text-white ring-white/10 placeholder:text-gray-400 focus:ring-sky-500': !errors?.length,
          'pr-10 text-red-600 ring-red-300 placeholder:text-red-300 focus:ring-red-500':
            errors?.length,
        }
      )}
      {value}
      {placeholder}
      {disabled}
      {autocomplete}
      aria-invalid={!!errors?.length}
      aria-describedby={`${name}-error`}
      on:keydown={() => (errors = [])}
    />
    {#if errors?.length}
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <Icon solid src={ExclamationCircle} class="h-5 w-5 text-red-500" aria-hidden="true" />
      </div>
    {/if}
  </div>
  {#if errors?.length}
    {#each errors as error}
      <p class="mt-2 text-sm text-red-600" id="email-error">{error}</p>
    {/each}
  {/if}
</div>
