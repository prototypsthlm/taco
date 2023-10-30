<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import PersonalityIcon from './PersonalityIcon.svelte'
  import type { LlmPersonality } from '@prisma/client'

  export let customPersonalities: LlmPersonality[] | null = null

  type SimplePersonality = {
    name: string
    context: string
  }

  const defaultPersonality: SimplePersonality = {
    name: 'Default',
    context: 'You are a helpful assistant.',
  }

  let personalities: SimplePersonality[] = []
  let selectedPersonality: SimplePersonality = defaultPersonality
  let dispatcher = createEventDispatcher()

  function selectPersonality(personality: SimplePersonality) {
    selectedPersonality = personality
    dispatcher('roleChange', personality)
  }

  onMount(() => {
    if (customPersonalities) {
      personalities = customPersonalities.map((personality) => ({
        name: personality.name,
        context: personality.context,
      }))
    } else {
      personalities = [
        {
          name: 'Developer',
          context:
            'You are a skilled software developer with expertise in various programming languages. Passionate about writing clean and efficient code, staying up-to-date with the latest industry trends, and helping others in the tech community.',
        },
        {
          name: 'Scientist',
          context:
            'You are a dedicated scientist with a curious mind and a passion for exploring the unknown. Your expertise spans various scientific disciplines, and you thrive on conducting research, analyzing data, and making groundbreaking discoveries.',
        },
      ]
    }

    personalities.push(defaultPersonality)
  })
</script>

<div class="flex flex-wrap gap-1 mx-8 justify-center overflow-hidden text-center">
  {#each personalities as personality}
    <button
      on:click={() => selectPersonality(personality)}
      class="flex flex-col rounded-lg md:min-w-[125px] lg:min-w-[150px] gap-2 bg-white p-3 sm:p-4 lg:p-6 {selectedPersonality ===
      personality
        ? 'bg-opacity-20'
        : 'bg-opacity-5'} hover:bg-opacity-20"
    >
      <PersonalityIcon context={personality.context} />
      <p class="text-sm md:text-3xl font-semibold tracking-tight text-white">
        {personality.name}
      </p>
    </button>
  {/each}
</div>
<p class="text-neutral-100 max-w-2xl text-center px-4 text-sm md:text-xl text-opacity-70">
  {selectedPersonality?.context}
</p>
