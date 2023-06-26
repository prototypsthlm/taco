<script>
  import ChatRoom from '$lib/components/ChatRoom.svelte'

  export let form
</script>

<ChatRoom chat={form?.chat || null} />
