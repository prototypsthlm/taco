<script lang="ts">
  import Avatar from '$lib/components/Avatar.svelte'
  import { socketUsersStore } from '$lib/stores/socket.js'
  import { scale } from 'svelte/transition'
</script>

{#if $socketUsersStore.length}
  <div class="{$$restProps?.class} flex -space-x-1">
    {#each $socketUsersStore as user}
      <div class="relative" in:scale>
        <Avatar
          {user}
          class="w-5 rounded-full ring-2 ring-[#262e3c]"
          dotClass=""
          dotConnectedClass="absolute -bottom-0.5 left-0.5 h-1.5 w-1.5 bg-green-400 ring-2 ring-[#262e3c]"
          dotDisconnectedClass="bottom-0 left-0 h-[.2rem] w-[.2rem] bg-[#262e3c] ring-[1.5px] ring-[#262e3c] ring-offset-[1.5px] ring-offset-gray-400"
        />
      </div>
    {/each}
  </div>
{/if}
