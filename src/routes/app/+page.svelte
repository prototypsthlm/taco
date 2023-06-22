<script>
  import ChatInput from '$lib/components/ChatInput.svelte'
</script>

<div class="flex flex-col justify-between items-center h-full w-full">
  <div class="flex flex-col justify-center items-center flex-grow h-full">
    <h1 class="text-accent text-5xl font-bold">New Chat!</h1>
    <p class="text-accent text-2xl">Choose your LLM personality</p>
  </div>

  <div class="m-4 md:m-8 w-full">
    <form method="POST" novalidate>
      <ChatInput  />
    </form>
  </div>
</div>
