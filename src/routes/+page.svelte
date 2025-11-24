<script lang="ts">
  import TacoIcon from '$lib/components/icons/TacoIcon.svelte'
  import {
    KeyIcon,
    CpuChipIcon,
    ChatBubbleLeftRightIcon,
    ShieldCheckIcon,
  } from '@babeard/svelte-heroicons/solid'
  import type { PageData } from './$types'

  export let data: PageData

  const features = [
    {
      name: 'Cutting edge models',
      description: 'Choose between OpenAl LLMs, including the latest GPT-4 TURBO 128K.',
      icon: CpuChipIcon,
    },
    {
      name: 'Group chats',
      description: 'Share chats with team members and continue chatting with the LLM together.',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'A single OpenAl API key',
      description: 'With Taco, your whole team shares a single Open Al account.',
      icon: KeyIcon,
    },
    {
      name: 'No training on your data',
      description: "OpenAI won't use the information you provide to improve its models.",
      icon: ShieldCheckIcon,
    },
  ]

  let isLoggedIn: boolean = data.isLoggedIn
</script>

<div class="bg-gray-900 py-24 sm:py-32 min-h-screen flex flex-col justify-center">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <div class="text-5xl md:text-7xl mb-12 md:mb-4 flex justify-center">
        <TacoIcon class="h-28 dark text-8xl" />
      </div>
      <div class="mb-8 rounded-lg bg-yellow-900/50 border border-yellow-600/50 px-6 py-4 text-left">
        <p class="text-lg font-semibold text-yellow-200 mb-3 text-center">
          All good things must come to an end
        </p>
        <p class="text-base text-yellow-100 mb-2">
          After careful consideration, we've made the difficult decision to shut down TACO on December 18th, 2025.
        </p>
        <p class="text-base text-yellow-100 mb-2">
          You can download your data from the settings page before the service shuts down.
        </p>
        <p class="text-base text-yellow-100">
          Thank you for being part of our journey. TACO is open source, and the code will remain publicly available on <a href="https://github.com/prototypsthlm/taco" target="_blank" class="underline hover:text-yellow-50">GitHub</a> for you to fork and self-host if you wish.
        </p>
      </div>
      <h2 class="text-base font-semibold leading-7 text-indigo-400">Team AI Chat pOrtal</h2>
      <p class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        A free and open source ChatGPT frontend
      </p>
      <p class="mt-6 text-lg leading-8 text-gray-300">
        Invite your team and start collaborating using OpenAl's cutting-edge LLMs.
      </p>
      <p class="text-lg leading-8 text-gray-300">
        Made with ❤️ by <a class="underline" href="https://www.prototyp.se/" target="_blank"
          >Prototyp</a
        >
      </p>
    </div>
    <div class="mx-auto mt-16 px-8 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
      <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
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
        <p class="text-sm text-neutral-100 opacity-70">Your are logged in!</p>
        <a
          href="/app"
          class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Start Chatting
        </a>
      </div>
    {:else}
      <div class="flex gap-8 items-center justify-center">
        <a
          data-testid="goto-signin"
          href="/signin"
          class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Sign in
        </a>
      </div>
    {/if}
  </div>
</div>
