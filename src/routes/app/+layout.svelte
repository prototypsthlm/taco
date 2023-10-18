<script lang="ts">
  import AppShell from '$lib/components/AppShell.svelte'
  import Notification from '$lib/components/Notification.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import { notificationStore } from '$lib/stores/notification'
  import type { PageData } from './$types'

  export let data: PageData

  notificationStore.set(data.user.notifications)
</script>

<svelte:head>
  <title>TACO</title>
</svelte:head>

<AppShell user={data.user}>
  <Sidebar slot="sidebar" user={data.user} />
  <slot slot="main" />
</AppShell>
<Notification />
