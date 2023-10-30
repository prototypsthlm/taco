<script lang="ts">
  import { onMount } from 'svelte'
  import '../app.css'

  let faviconPath = '/favicon.png'

  function updateThemeAndFavicon(matchesDark: boolean) {
    if (matchesDark) {
      document.documentElement.classList.add('dark')
      faviconPath = '/favicon-dark.png'
    } else {
      faviconPath = '/favicon.png'
      document.documentElement.classList.remove('dark')
    }
  }

  onMount(async () => {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')

    updateThemeAndFavicon(mediaQueryList.matches)

    mediaQueryList.addEventListener('change', (e) => {
      updateThemeAndFavicon(e.matches)
    })
  })
</script>

<svelte:head>
  <link id="favicon" rel="icon" href={faviconPath} type="image/png" />
  <title>TACO</title>
</svelte:head>

<slot />
