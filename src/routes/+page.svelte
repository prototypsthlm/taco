<script lang="ts">
  import { KeyIcon, UserCircleIcon } from '@babeard/svelte-heroicons/solid'
  import type { PageData } from './$types'
  import TacoIcon from '$lib/components/icons/TacoIcon.svelte'
  import ForkIcon from '$lib/components/icons/ForkIcon.svelte'

  export let data: PageData

  const features = [
    {
      name: 'LLM personalities',
      description:
        'Choose from a variety of LLM personalities to use in your chat. Soon you can also create your own LLM personality.',
      icon: UserCircleIcon,
    },
    {
      name: 'Forking chats',
      description:
        'Keep context of a chat by forking it. You can fork a chat at any point in time and continue the conversation in a new chat.',
      icon: ForkIcon,
    },
    {
      name: 'One API Key',
      description:
        'Use one API key for the whole team instead of every member using the ChatGPT website.',
      icon: KeyIcon,
    },
  ]

  let isLoggedIn: boolean = data.isLoggedIn
</script>

<div class="bg-gray-900 py-24 sm:py-32 min-h-screen flex flex-col justify-center">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mx-auto max-w-2xl lg:text-center">
      <div class="text-5xl md:text-7xl mb-12 md:mb-4">
        <TacoIcon class="h-24 md:h-32" />
      </div>
      <h2 class="text-base font-semibold leading-7 text-indigo-400">Team AI Chat pOrtal</h2>
      <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        All in one solution for using LLMs
      </p>
      <p class="mt-6 text-lg leading-8 text-gray-300">
        Collaborate with your team LLMs together in one place. Get an advantage of useful features
        to improve your poductivity and collaboration between team members.
      </p>
    </div>
    <div class="mx-auto mt-16 px-8 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
      <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
        {#each features as feature}
          <div class="flex flex-col">
            <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
              <svelte:component
                this={feature.icon}
                class="h-5 w-5 flex-none text-indigo-400"
                aria-hidden="true"
              />
              {feature.name}
            </dt>
            <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
              <p class="flex-auto">{feature.description}</p>
            </dd>
          </div>
        {/each}
      </dl>
    </div>
  </div>
  <div class="mt-16 md:mt-32">
    {#if isLoggedIn}
      <div class="flex flex-col gap-2 items-center">
        <p class="text-sm text-accent opacity-70">Your are logged in!</p>
        <a
          href="/app"
          class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Start Chatting
        </a>
      </div>
    {:else}
      <div class="flex gap-8 items-center justify-center">
        <a
          href="/signin"
          class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Sign in
        </a>
        <p class="text-white opacity-70">or</p>
        <a href="/signup" class="text-sm font-semibold leading-6 text-white"
          >Register <span aria-hidden="true">→</span></a
        >
      </div>
    {/if}
  </div>
</div>
