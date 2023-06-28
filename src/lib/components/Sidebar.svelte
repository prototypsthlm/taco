<script lang="ts">
  import Message from 'svelte-material-icons/Message.svelte'
  import ForumPlus from 'svelte-material-icons/ForumPlus.svelte'
  import { page } from '$app/stores';  

  export let chats = []

  $: sortedChats = chats.sort((a, b) => a.updatedAt - b.updatedAt)
</script>

<div class="h-full w-96 bg-primary">
  <div class="h-full flex flex-col gap-1 overflow-scroll">
    <a href="/app" class="mx-3 mt-2 px-4 py-4 rounded-xl hover:bg-secondary flex gap-4">
      <ForumPlus class="w-8 h-8 text-accent" />
      <p class="text-white text-2xl">
        New Chat
      </p>
    </a>
    <hr class="border-accent mx-4 my-4 border-opacity-50" />
    {#each sortedChats as chat}
        <a
          href="/app/chat/{chat.id}"
          class="flex gap-4 h-full mx-3 rounded-lg py-3 px-4 hover:bg-secondary hover:bg-opacity-75"
          class:bg-secondary={$page.url.pathname == `/app/chat/${chat.id}`}
        >
          <Message class="w-8 h-8 text-accent" />
          <!-- <p class="text-xl text-accent">{chat.updatedAt}</p> -->
          <p class="text-xl text-accent">{chat.name} Nr. {chat.id}</p>
        </a>
    {/each}
  </div>
</div>
