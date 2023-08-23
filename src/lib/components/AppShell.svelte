<script lang="ts">
  import type { UserBySessionId } from '$lib/server/entities/user'
  import { isSidebarOpen } from '$lib/stores/general'
  import { Bars3Icon, XMarkIcon } from '@babeard/svelte-heroicons/outline'
  import { TransitionChild, TransitionRoot } from '@rgossiaux/svelte-headlessui'
  import { onMount } from 'svelte'
  import Gravatar from './Gravatar.svelte'
  import TacoIcon from './icons/TacoIcon.svelte'

  export let user: UserBySessionId

  let sidebarOpen: boolean

  isSidebarOpen.subscribe((value) => {
    sidebarOpen = value
  })
</script>

<div class="flex flex-col justify-between h-screen max-h-[-webkit-fill-available] bg-gray-900">
  <TransitionRoot show={sidebarOpen}>
    <div class="relative z-50 lg:hidden">
      <TransitionChild
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/80" />
      </TransitionChild>

      <div class="fixed inset-0 flex">
        <TransitionChild
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div class="relative mr-16 flex w-screen max-w-xs flex-1">
            <TransitionChild
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  class="-m-2.5 p-2.5"
                  on:click={() => isSidebarOpen.set(false)}
                >
                  <span class="sr-only">Close sidebar</span>
                  <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <!-- Sidebar component, swap this element with another sidebar if you like -->
            <div
              class="h-screen flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10"
            >
              <div class="flex h-16 items-center">
                <a class="text-white text-2xl" href="/app">
                  <TacoIcon class="h-10 w-auto" />
                </a>
              </div>
              <nav class="flex flex-1 flex-col overflow-hidden">
                <div class="flex flex-1 flex-col gap-y-7 overflow-hidden">
                  <slot name="sidebar" />
                </div>
              </nav>
            </div>
          </div>
        </TransitionChild>
      </div>
    </div>
  </TransitionRoot>

  <!-- Static sidebar for desktop -->
  <div
    class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r-2 border-gray-800"
  >
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <nav class="flex flex-col justify-between gap-y-4 bg-gray-900 h-screen">
      <a class="flex h-20 pt-3 items-center pl-8 text-white text-2xl" href="/app">
        <TacoIcon class="h-12 w-auto" />
      </a>
      <div class="grow overflow-hidden px-4">
        <slot name="sidebar" />
      </div>
      <a
        href="/app/settings"
        class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
      >
        <Gravatar class="h-8 w-8 rounded-full bg-gray-800" value={user.email} />
        <span class="sr-only">Your profile</span>
        <span aria-hidden="true">{user.name}</span>
      </a>
    </nav>
  </div>

  <div
    class="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden"
  >
    <button
      type="button"
      class="-m-2.5 p-2.5 text-gray-400 lg:hidden"
      on:click={() => isSidebarOpen.set(true)}
    >
      <span class="sr-only">Open sidebar</span>
      <Bars3Icon class="h-6 w-6" aria-hidden="true" />
    </button>
    <div class="flex-1 text-sm font-semibold leading-6 text-white">
      <slot name="title" />
    </div>
    <a href="/app/settings">
      <span class="sr-only">Your profile</span>
      <Gravatar class="h-8 w-8 rounded-full bg-gray-800" value={user.email} />
    </a>
  </div>

  <main class="lg:ml-72 grow overflow-scroll">
    <slot name="main" />
  </main>
</div>
