<script lang="ts">
  import ButtonLink from '$lib/components/ButtonLink.svelte'
  import FeatureBox from '$lib/components/FeatureBox.svelte'
  import type { PageData } from './$types'

  export let data: PageData

  let isLoggedIn: boolean = data.isLoggedIn
</script>

<div
  class="flex flex-col gap-12 justify-center items-center bg-secondary min-w-screen min-h-screen pt-8 pb-16"
>
  <div class="font-bold text-accent text-center px-4">
    <h3 class="text-5xl md:text-6xl">Prototyps</h3>
    <h1 class="text-6xl md:text-7xl">LLM Portal 🌀</h1>
    <p class="text-accent text-xl md:text-2xl mt-8">
      Use the large language model to increase your poductivity
    </p>
  </div>

  <div class="flex justify-center gap-4 md:gap-8 max-w-7xl flex-wrap px-4">
    <FeatureBox
      title="Chat with ChatGPT"
      description="Chat with a GPT-3 powered chatbot!"
      emoji="💬"
      isImplemented={false}
    />
    <FeatureBox
      title="One API key for everything"
      description="Use one API key for the whole team and safe costs!"
      emoji="📉"
      isImplemented={false}
    />
    <FeatureBox
      title="Personalities for the LLM"
      description="Improve your answers by giving the LLM a right personality from the start!"
      emoji="👥"
      isImplemented={false}
    />
    <FeatureBox
      title="Quality of Life improvements"
      description="Improvments like favorite chats, reactions on messages and more!"
      emoji="💫"
      isImplemented={false}
    />
    <FeatureBox
      title="Keep chat histories in a database"
      description="Chats are saved in a database and can be accessed later!"
      emoji="🗃️"
      isImplemented={false}
    />
    <FeatureBox
      title="Shared Chats"
      description="Share you chat with a team member and write in the same chat live!"
      emoji="🔗"
      isImplemented={false}
    />
  </div>

  {#if isLoggedIn}
    <div class="flex flex-col gap-2 items-center">
      <p class="text-xl text-accent">Your are logged in!</p>
      <ButtonLink href="/app" text="Start Chatting" />
    </div>
  {:else}
    <div class="flex flex-col gap-4 items-center">
      <p class="text-xl text-accent">You need to login to chat!</p>
      <div class="flex items-center gap-4">
        <ButtonLink href="/signin" text="Sign in" />
        <p class="text-xl text-accent">or</p>
        <ButtonLink href="/signup" text="Sign up" />
      </div>
    </div>
  {/if}
</div>
