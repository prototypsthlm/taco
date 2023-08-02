<script lang="ts">
  import ChatRoom from '$lib/components/ChatRoom.svelte'
  import type { ActionData } from './$types'

  export let form: ActionData
</script>

<ChatRoom chat={form?.chat || null} />
