<script lang="ts">
  import AppShell from '$lib/components/AppShell.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<svelte:head>
  <title>TACO</title>
</svelte:head>

<AppShell user={data.user}>
  <Sidebar slot="sidebar" user={data.user} />
  <slot slot="main" />
</AppShell>
