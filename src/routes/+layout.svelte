<script lang="ts">
  import { onMount } from 'svelte'
  import '../app.css'
  import { PUBLIC_SITE_URL } from '$env/static/public'

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
  <meta property="og:title" content="TACO" />
  <meta property="og:description" content="A free and open source ChatGPT frontend" />
  <meta property="og:image" content={`${PUBLIC_SITE_URL}/share.png`} />
  <meta property="og:type" content="website" />
</svelte:head>

<slot />
