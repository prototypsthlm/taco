<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData
</script>

{#if data.users.length > 0}
  <ul>
    {#each data.users as user (user.id)}
      <li>{user.name}</li>
    {/each}
  </ul>
{:else}
  <p>Loading users...</p>
{/if}
