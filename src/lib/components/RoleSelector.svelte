<script lang="ts">
  import Beaker from '@babeard/svelte-heroicons/solid/Beaker'
  import Briefcase from '@babeard/svelte-heroicons/solid/Briefcase'
  import ChatBubbleBottomCenter from '@babeard/svelte-heroicons/solid/ChatBubbleBottomCenter'
  import CodeBracket from '@babeard/svelte-heroicons/solid/CodeBracket'
  import MusicalNote from '@babeard/svelte-heroicons/solid/MusicalNote'
  import { createEventDispatcher } from 'svelte'

  type Role = {
    name: string
    prompt: string
    icon: any
  }

  let roles: Role[] = [
    {
      name: 'Developer',
      prompt:
        'You are a skilled software developer with expertise in various programming languages. Passionate about writing clean and efficient code, staying up-to-date with the latest industry trends, and helping others in the tech community.',
      icon: CodeBracket,
    },
    {
      name: 'Scientist',
      prompt:
        'You are a dedicated scientist with a curious mind and a passion for exploring the unknown. Your expertise spans various scientific disciplines, and you thrive on conducting research, analyzing data, and making groundbreaking discoveries.',
      icon: Beaker,
    },
    {
      name: 'Default',
      prompt: 'You are a helpful assistant.',
      icon: ChatBubbleBottomCenter,
    },
    {
      name: 'Business',
      prompt:
        'As a business helper, you excel in providing valuable insights and solutions to help businesses thrive. You have a deep understanding of various industries, market trends, and strategic planning, enabling you to offer expert advice on boosting efficiency, increasing revenue, and achieving overall success.',
      icon: Briefcase,
    },
    {
      name: 'Musician',
      prompt:
        'As a musician, you live and breathe the art of sound and melody. Your passion for music drives you to create captivating compositions, explore different genres, and connect with audiences on an emotional level through your performances.',
      icon: MusicalNote,
    },
  ]

  let dispatcher = createEventDispatcher()

  function selectRole(role: Role) {
    selectedRole = role
    dispatcher('roleChange', role)
  }

  let selectedRole: Role | null = roles[2]
</script>

<div class="flex flex-wrap gap-1 mx-8 justify-center overflow-hidden text-center">
  {#each roles as role}
    <button
      on:click={() => selectRole(role)}
      class="flex flex-col rounded-lg md:min-w-[200px] gap-2 bg-white p-4 md:p-8 {selectedRole === role ? 'bg-opacity-20' : 'bg-opacity-5'} hover:bg-opacity-20"
    >
      <svelte:component this={role.icon} class="w-6 h-6 md:w-12 md:h-12 mx-auto text-white" />
      <p class="text-md md:text-3xl font-semibold tracking-tight text-white">
        {role.name}
      </p>
    </button>
  {/each}
</div>
