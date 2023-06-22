<script lang="ts">
  import { enhance } from '$app/forms'

  export let data
</script>

<div>
  <ul>
    {#if data?.chat?.messages?.length}
      {#each data.chat.messages as message}
        <li>Q: {message.question}</li>
        <li>A: {message.answer}</li>
      {/each}
    {/if}
  </ul>

  <form method="post" use:enhance>
    <input type="text" name="message" />
  </form>
</div>
