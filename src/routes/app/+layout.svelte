<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte'

  export let data
</script>

<div class="flex h-screen w-screen bg-secondary">
  <Sidebar chats={data.chats} />
  <div class="flex flex-col h-full w-full">
    <slot />
  </div>
</div>
