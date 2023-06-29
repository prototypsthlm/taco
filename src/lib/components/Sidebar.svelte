<script lang="ts">
  import ForumPlus from 'svelte-material-icons/ForumPlus.svelte'
  import { page } from '$app/stores'
  import ChatLink from '$lib/components/ChatLink.svelte'

  export let chats = []

  $: sortedChats = chats.sort((a, b) => a.updatedAt - b.updatedAt).reverse()
</script>

<div class="h-full w-96 bg-primary">
  <div class="h-full flex flex-col gap-1 overflow-scroll">
    <a
      href="/app"
      class="mx-3 mt-2 px-4 py-4 rounded-xl hover:bg-secondary flex gap-4 duration-150"
    >
      <ForumPlus class="w-8 h-8 text-accent" />
      <p class="text-white text-2xl">New Chat</p>
    </a>
    <hr class="border-accent mx-4 my-2 border-opacity-50" />
    {#each sortedChats as chat}
      <ChatLink
        chatId={chat.id}
        name={chat.name}
        isCurrentPage={$page.url.pathname == `/app/chat/${chat.id}`}
      />
    {/each}
  </div>
</div>
