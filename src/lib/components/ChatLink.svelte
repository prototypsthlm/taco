<script lang="ts">
  import Message from 'svelte-material-icons/Message.svelte'

  export let chatId: number
  export let name: string
  export let isCurrentPage: boolean
</script>

<a
  href="/app/chat/{chatId}"
  class="flex gap-4 h-full mx-3 rounded-lg py-3 px-4 hover:bg-secondary hover:bg-opacity-75 duration-150"
  class:bg-secondary={isCurrentPage}
>
  <Message class="w-8 h-8 text-accent" />
  <p class="text-xl text-accent">{name} Nr. {chatId}</p>
</a>
