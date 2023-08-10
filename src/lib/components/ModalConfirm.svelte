<script lang="ts">
  import {
    TransitionRoot,
    Dialog,
    TransitionChild,
    DialogTitle,
  } from '@rgossiaux/svelte-headlessui'
  import { ExclamationTriangleIcon } from '@babeard/svelte-heroicons/outline'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let open = false
</script>

<TransitionRoot show={open}>
  <Dialog as="div" class="relative z-10" on:close={() => (open = false)}>
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
                class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900"
                  ><slot name="title" /></DialogTitle
                >
                <div class="mt-2">
                  <slot name="body" />
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                on:click={() => {
                  open = false
                  dispatch('confirm')
                }}><slot name="confirm-button" /></button
              >
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                on:click={() => (open = false)}><slot name="cancel-button" /></button
              >
            </div>
          </div>
        </TransitionChild>
      </div>
    </div>
  </Dialog>
</TransitionRoot>
