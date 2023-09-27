<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import { connectedUsersStore } from '$lib/stores/chatSockets.js'
  import type { User } from '@prisma/client'
  import { scale } from 'svelte/transition'

  export let users: User[] = []
</script>

{#if users.length}
  <div class="{$$restProps?.class} flex-shrink-0 flex -space-x-1">
    {#each users as user}
      <div class="relative" in:scale>
        <Gravatar
          title={user.email}
          class="w-5 rounded-full overflow-hidden ring-2 ring-[#262e3c]"
          value={user.email}
        />
        {#if $connectedUsersStore.map((x) => x.id).includes(user.id)}
          <span
            title="Connected!"
            class="absolute bottom-0 left-0.5 block h-1.5 w-1.5 rounded-full bg-green-400 ring-1 ring-white"
          />
        {/if}
      </div>
    {/each}
  </div>
{/if}
