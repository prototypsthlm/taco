<script lang="ts">
  import classNames from 'classnames'
  import {
    Icon,
    CheckCircle,
    XCircle,
    ExclamationTriangle,
    InformationCircle,
  } from 'svelte-hero-icons'
  export let message: string
  export let type = 'info'

  const typeMap = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      iconColor: 'text-green-400',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      iconColor: 'text-yellow-400',
      icon: ExclamationTriangle,
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      iconColor: 'text-red-400',
      icon: XCircle,
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconColor: 'text-blue-400',
      icon: InformationCircle,
    },
  }
</script>

{#if message}
  <div class={classNames('p-4', typeMap[type].bg, $$props.class)}>
    <div class="flex">
      <div class="flex-shrink-0">
        <Icon
          class={classNames('w-5', typeMap[type].iconColor)}
          src={typeMap[type].icon}
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
