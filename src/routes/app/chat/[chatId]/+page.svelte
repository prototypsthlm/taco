<script lang="ts">
  import ChatRoom from '$lib/components/ChatRoom.svelte'

  import type { PageData } from './$types'

  export let data: PageData
</script>

<ChatRoom chat={data.chat} />
