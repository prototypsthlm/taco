<script lang="ts">
  import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
  } from '@babeard/svelte-heroicons/solid'
  import classNames from 'classnames'
  import { slide } from 'svelte/transition'

  export let title: string
  export let body: string | undefined = undefined
  export let type: 'success' | 'warning' | 'error' | 'info' = 'info'

  const typeMap = {
    success: {
      bg: 'bg-green-50',
      title: 'text-green-800',
      body: 'text-green-700',
      iconColor: 'text-green-400',
      icon: CheckCircleIcon,
    },
    warning: {
      bg: 'bg-yellow-50',
      title: 'text-yellow-800',
      body: 'text-yellow-700',
      iconColor: 'text-yellow-400',
      icon: ExclamationTriangleIcon,
    },
    error: {
      bg: 'bg-red-50',
      title: 'text-red-800',
      body: 'text-red-700',
      iconColor: 'text-red-400',
      icon: XCircleIcon,
    },
    info: {
      bg: 'bg-blue-50',
      title: 'text-blue-800',
      body: 'text-blue-700',
      iconColor: 'text-blue-400',
      icon: InformationCircleIcon,
    },
  }
</script>

{#if title || body}
  <div transition:slide class={classNames('rounded-md p-4', typeMap[type].bg, $$props.class)}>
    <div class="flex">
      <div class="flex-shrink-0">
        <svelte:component
          this={typeMap[type].icon}
          class={classNames('w-5', typeMap[type].iconColor)}
          aria-hidden="true"
        />
      </div>
      <div class="ml-3">
        {#if title}
          <h3 class={classNames('text-sm font-medium', typeMap[type].title)}>{title}</h3>
        {/if}
        {#if $$slots.default}
          <div class={classNames('mt-2 text-sm', typeMap[type].body)}>
            <slot />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
