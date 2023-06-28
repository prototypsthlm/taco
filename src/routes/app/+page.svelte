<script>
  import AppShell from '$lib/components/AppShell.svelte'
  import ChatRoom from '$lib/components/ChatRoom.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'

  export let form
</script>

<AppShell>
  <Sidebar slot="sidebar" />
  <ChatRoom slot="main" chat={form?.chat || null} />
</AppShell>
