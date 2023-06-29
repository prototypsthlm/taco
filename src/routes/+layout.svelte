<script lang="ts">
  import '../app.css'

  import { onMount } from 'svelte'

  onMount(async () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    })
  })
</script>

<svelte:head>
  <title>LLM Portal</title>
</svelte:head>

<slot />
