<script lang="ts">
  import { ExclamationTriangleIcon, InformationCircleIcon } from '@babeard/svelte-heroicons/outline'
  import {
    TransitionRoot,
    Dialog,
    TransitionChild,
    DialogTitle,
  } from '@rgossiaux/svelte-headlessui'
  import { createEventDispatcher } from 'svelte'
  import classNames from 'classnames'

  export let type: 'warning' | 'info' = 'info'

  let show = false
  const dispatch = createEventDispatcher()

  function open() {
    show = true
  }

  function confirm() {
    show = false
    dispatch('confirm')
  }

  function cancel(e: Event) {
    if (e.currentTarget === e.target) {
      show = false
    }
  }
</script>

<TransitionRoot {show}>
  <Dialog as="div" class="relative z-50" on:close={cancel}>
    <TransitionChild
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
    </TransitionChild>

    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          >
            <div class="sm:flex sm:items-start">
              <div
                class={classNames(
                  'mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10',
                  { 'bg-blue-100': type === 'info' },
                  { 'bg-red-100': type === 'warning' }
                )}
              >
                {#if type === 'warning'}
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
                {:else if type === 'info'}
                  <InformationCircleIcon class="h-6 w-6 text-blue-600" aria-hidden="true" />
                {/if}
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                  <slot name="title" />
                </DialogTitle>
                <div class="mt-2">
                  <slot name="body" />
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class={classNames(
                  'inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto',
                  { 'bg-blue-600 hover:bg-blue-500': type === 'info' },
                  { 'bg-red-600 hover:bg-red-500': type === 'warning' }
                )}
                on:click={confirm}
              >
                <slot name="confirm">Confirm</slot>
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                on:click={cancel}
              >
                <slot name="cancel">Cancel</slot>
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </div>
  </Dialog>
</TransitionRoot>

<div on:click={open} on:keyup={open}>
  <slot name="trigger" />
</div>
