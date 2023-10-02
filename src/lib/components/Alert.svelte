<script lang="ts">
  import classNames from 'classnames'
  import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
  } from '@babeard/svelte-heroicons/solid'
  export let message: string
  export let type: 'success' | 'warning' | 'error' | 'info' = 'info'

  const typeMap = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      iconColor: 'text-green-400',
      icon: CheckCircleIcon,
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      iconColor: 'text-yellow-400',
      icon: ExclamationTriangleIcon,
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      iconColor: 'text-red-400',
      icon: XCircleIcon,
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconColor: 'text-blue-400',
      icon: InformationCircleIcon,
    },
  }
</script>

{#if message}
  <div class={classNames('rounded-md p-4', typeMap[type].bg, $$props.class)}>
    <div class="flex">
      <div class="flex-shrink-0">
        <svelte:component
          this={typeMap[type].icon}
          class={classNames('w-5', typeMap[type].iconColor)}
          aria-hidden="true"
        />
      </div>
      <div class="ml-3 flex-1 md:flex md:justify-between">
        <p class={classNames('text-sm', typeMap[type].text)}>
          {message}
        </p>
      </div>
    </div>
  </div>
{/if}
