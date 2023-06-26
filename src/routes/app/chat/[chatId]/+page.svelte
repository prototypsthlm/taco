<script>
  import ChatRoom from '$lib/components/ChatRoom.svelte'

  export let data
  export let form
</script>

<ChatRoom chat={data?.chat || null} />
