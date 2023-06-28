<script lang="ts">
  import { Bars3Icon, XMarkIcon } from '@babeard/svelte-heroicons/outline'
  import type { User } from '@prisma/client'
  import { Dialog, TransitionChild, TransitionRoot } from '@rgossiaux/svelte-headlessui'
  import logo from '$lib/assets/logo.png'
  import md5 from 'crypto-js/md5'

  export let user: User

  let sidebarOpen = false
</script>

<div class="min-h-screen">
  <TransitionRoot show={sidebarOpen}>
    <Dialog as="div" class="relative z-50 lg:hidden" on:close={() => (sidebarOpen = false)}>
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
          <div class="relative mr-16 flex w-full max-w-xs flex-1">
            <TransitionChild
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" class="-m-2.5 p-2.5" on:click={() => (sidebarOpen = false)}>
                  <span class="sr-only">Close sidebar</span>
                  <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <!-- Sidebar component, swap this element with another sidebar if you like -->
            <div
              class="min-h-screen flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10"
            >
              <div class="flex h-16 shrink-0 items-center">
                <img class="h-8 w-auto" src={logo} alt="LLM Portal" />
              </div>
              <nav class="flex flex-1 flex-col">
                <div class="flex flex-1 flex-col gap-y-7">
                  <slot name="sidebar" />
                </div>
              </nav>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Static sidebar for desktop -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
      <div class="flex h-16 shrink-0 items-center">
        <img class="h-8 w-auto" src={logo} alt="LLM Portal" />
      </div>
      <nav class="flex flex-1 flex-col">
        <div class="flex flex-1 flex-col gap-y-7">
          <slot name="sidebar" />
          <div class="-mx-6 mt-auto">
            <a
              href="/app/settings"
              class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
            >
              <img
                class="h-8 w-8 rounded-full bg-gray-800"
                src={`https://www.gravatar.com/avatar/${md5(user.email)}`}
                alt=""
              />
              <span class="sr-only">Your profile</span>
              <span aria-hidden="true">{user.name}</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  </div>

  <div
    class="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden"
  >
    <button
      type="button"
      class="-m-2.5 p-2.5 text-gray-400 lg:hidden"
      on:click={() => (sidebarOpen = true)}
    >
      <span class="sr-only">Open sidebar</span>
      <Bars3Icon class="h-6 w-6" aria-hidden="true" />
    </button>
    <div class="flex-1 text-sm font-semibold leading-6 text-white">LLM Portal</div>
    <a href="/app/settings">
      <span class="sr-only">Your profile</span>
      <img
        class="h-8 w-8 rounded-full bg-gray-800"
        src={`https://www.gravatar.com/avatar/${md5(user.email)}`}
        alt=""
      />
    </a>
  </div>

  <main class="py-10 lg:pl-72">
    <div class="px-4 sm:px-6 lg:px-8">
      <slot name="main" />
    </div>
  </main>
</div>
