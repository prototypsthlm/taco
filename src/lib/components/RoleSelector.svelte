<script lang="ts">
  import Beaker from '@babeard/svelte-heroicons/solid/Beaker'
  import Briefcase from '@babeard/svelte-heroicons/solid/Briefcase'
  import ChatBubbleBottomCenter from '@babeard/svelte-heroicons/solid/ChatBubbleBottomCenter'
  import CodeBracket from '@babeard/svelte-heroicons/solid/CodeBracket'
  import MusicalNote from '@babeard/svelte-heroicons/solid/MusicalNote'

  type Role = {
    name: string
    prompt: string
    icon: any
  }

  let roles: Role[] = [
    {
      name: 'Developer',
      prompt: 'Helping with all question around coding',
      icon: CodeBracket,
    },
    {
      name: 'Scientist',
      prompt: 'Expert in question around science',
      icon: Beaker,
    },
    {
      name: 'Default',
      prompt: 'Helping out with all questions',
      icon: ChatBubbleBottomCenter,
    },
    {
      name: 'Business',
      prompt: 'Business help around strategy and marketing',
      icon: Briefcase,
    },
    {
      name: 'Musician',
      prompt: 'Let you music be heard and improved',
      icon: MusicalNote,
    },
  ]

  function selectRole(role: Role) {
    selectedRole = role
  }

  let selectedRole: Role | null = roles[2]
</script>

<div class="flex flex-wrap gap-1 mx-8 justify-center overflow-hidden text-center">
  {#each roles as role}
    <button
      on:click={() => selectRole(role)}
      class:bg-opacity-20={selectedRole === role}
      class="flex flex-col rounded-lg md:min-w-[200px] gap-2 bg-white p-4 md:p-8 bg-opacity-5 hover:bg-opacity-20"
    >
      <svelte:component this={role.icon} class="w-6 h-6 md:w-12 md:h-12 mx-auto text-white" />
      <p class="text-md md:text-3xl font-semibold tracking-tight text-white">
        {role.name}
      </p>
    </button>
  {/each}
</div>
