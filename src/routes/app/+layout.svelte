<script lang="ts">
  import ChatInput from '$lib/components/ChatInput.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
</script>

<div class="flex h-screen w-screen bg-secondary">
  <Sidebar />
  <div class="flex flex-col h-full w-full">
    <div class="flex-grow">
      <slot />
    </div>
    <div class="p-4 md:p-8">
      <ChatInput />
    </div>
  </div>
</div>
