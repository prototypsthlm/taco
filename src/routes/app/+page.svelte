<script>
  import ChatInput from '$lib/components/ChatInput.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
</script>

<div class="flex h-screen w-screen">
  <Sidebar />
  <div class="flex flex-col h-full w-full">
    <div class="flex-grow">
      <slot />
    </div>
    <ChatInput />
  </div>
</div>
