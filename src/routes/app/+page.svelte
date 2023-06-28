<script lang="ts">
  import AppShell from '$lib/components/AppShell.svelte'
  import ChatRoom from '$lib/components/ChatRoom.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData
</script>

<AppShell user={data.user}>
  <Sidebar slot="sidebar" />
  <ChatRoom slot="main" chat={form?.chat || null} />
</AppShell>
