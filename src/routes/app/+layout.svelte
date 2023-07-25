<script lang="ts">
  import AppShell from '$lib/components/AppShell.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'

  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData
</script>

<AppShell user={data.user}>
  <Sidebar slot="sidebar" teams={data.teams} chats={data.chats} currentChat={form?.chat || data?.chat || null} />
  <slot slot="main" />
</AppShell>
