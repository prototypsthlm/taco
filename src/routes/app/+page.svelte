<script lang="ts">
  import ChatRoom from '$lib/components/ChatRoom.svelte'
  import { resetToNewChat } from '$lib/stores/chat'
  import type { ActionData } from './$types'

  export let form: ActionData

  let unique = {}

  $: if ($resetToNewChat) {
    $resetToNewChat = false
    unique = {}
    form = null
  }
</script>

{#key unique}
  <ChatRoom chat={form?.chat} />
{/key}
