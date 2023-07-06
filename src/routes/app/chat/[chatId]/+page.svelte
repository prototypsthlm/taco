<script lang="ts">
  import AppShell from '$lib/components/AppShell.svelte'
  import ChatRoom from '$lib/components/ChatRoom.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'

  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData
</script>

<AppShell user={data.user}>
  <Sidebar slot="sidebar" chats={data.chats} />
  <ChatRoom slot="main" chat={form?.chat || data?.chat || null} />
</AppShell>
