<script lang="ts">
  import Chat from 'svelte-material-icons/Chat.svelte'
  import { page } from '$app/stores';  

  export let chats = []
</script>

<div class="h-full w-96 bg-primary">
  <div class="h-full flex flex-col gap-1 overflow-scroll">
    {#each chats as chat}
        <a
          href="/app/chat/{chat.id}"
          class="flex gap-4 h-full mx-3 rounded-lg py-3 px-4 hover:bg-gray-500"
          class:bg-gray-500={$page.url.pathname == `/app/chat/${chat.id}`}
        >
          <Chat class="w-8 h-8 text-accent" />
          <p class="text-xl text-accent">{chat.name} Nr. {chat.id}</p>
        </a>
    {/each}
  </div>
</div>
