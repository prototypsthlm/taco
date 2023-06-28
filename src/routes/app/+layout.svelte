<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte'
</script>

<div class="flex h-screen w-screen bg-secondary">
  <Sidebar />
  <div class="flex flex-col h-full w-full">
    <slot />
  </div>
</div>
