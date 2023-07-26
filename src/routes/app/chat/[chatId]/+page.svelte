<script lang="ts">
  import ChatRoom from '$lib/components/ChatRoom.svelte'

  import type { PageData, ActionData } from './$types'

  export let data: PageData
  export let form: ActionData
</script>

<ChatRoom chat={form?.chat || data?.chat || null} />
