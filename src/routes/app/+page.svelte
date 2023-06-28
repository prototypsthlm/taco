<script>
  import AppShell from '$lib/components/AppShell.svelte'
  import ChatRoom from '$lib/components/ChatRoom.svelte'
  import SidebarDesktop from '$lib/components/SidebarDesktop.svelte'
  import SidebarMobile from '$lib/components/SidebarMobile.svelte'

  export let form
</script>

<AppShell>
  <SidebarDesktop slot="sidebar-desktop" />
  <SidebarMobile slot="sidebar-mobile" />
  <ChatRoom slot="main" chat={form?.chat || null} />
</AppShell>
