<script lang="ts">
  import { ChatBubbleBottomCenterIcon } from '@babeard/svelte-heroicons/solid'
  import Beaker from '@babeard/svelte-heroicons/solid/Beaker'
  import Briefcase from '@babeard/svelte-heroicons/solid/Briefcase'
  import CodeBracket from '@babeard/svelte-heroicons/solid/CodeBracket'
  import MusicalNote from '@babeard/svelte-heroicons/solid/MusicalNote'
  import Squares2x2 from '@babeard/svelte-heroicons/solid/Squares2x2'
  import VideoCamera from '@babeard/svelte-heroicons/solid/VideoCamera'
  import WrenchScrewdriver from '@babeard/svelte-heroicons/solid/WrenchScrewdriver'
  import { onMount } from 'svelte'

  export let context: string
  let icon = Squares2x2

  onMount(() => {
    icon = matchContextToIcon(context)
  })

  function matchContextToIcon(context: string) {
    if (includesArray(context, ['software', 'developer', 'programming', 'code'])) return CodeBracket
    if (includesArray(context, ['scientist', 'scientific', 'research'])) return Beaker
    if (includesArray(context, ['business', 'market trends', 'industries', 'revenue']))
      return Briefcase
    if (includesArray(context, ['music', 'melody', 'sound', 'composition', 'audio']))
      return MusicalNote
    if (includesArray(context, ['car', 'mechanic', 'repair'])) return WrenchScrewdriver
    if (includesArray(context, ['photo', 'camera', 'filming', 'movie'])) return VideoCamera
    if (includesArray(context, ['helpful assistant'])) return ChatBubbleBottomCenterIcon
    return Squares2x2
  }

  function includesArray(text: string, array: string[]): boolean {
    for (let index = 0; index < array.length; index++) {
      const substring = array[index]
      if (text.includes(substring)) {
        return true
      }
    }
    return false
  }
</script>

<svelte:component this={icon} class="w-6 h-6 md:w-12 md:h-12 mx-auto text-white" />
