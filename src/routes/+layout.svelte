<script>
  import ChatInput from '$lib/components/ChatInput.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import '../app.css';
</script>

<svelte:head>
  <title>LLM Portal</title>
</svelte:head>

<div class="flex h-screen w-screen">
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
