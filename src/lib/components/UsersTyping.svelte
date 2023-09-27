<script>
  import { socketUsersStore } from '$lib/stores/socket'
</script>

<div class="flex gap-1">
  {#each $socketUsersStore.filter((u) => u.typing) as user (user.id)}
    <div class="flex items-center">
      <span><span class="font-bold truncate">{user.name}</span> is typing</span>
      <div class="flex ml-0.5 gap-0.5">
        <span class="opacity-0 animate-fade-in-out" style="animation-delay: 0s">.</span>
        <span class="opacity-0 animate-fade-in-out" style="animation-delay: 0.1s">.</span>
        <span class="opacity-0 animate-fade-in-out" style="animation-delay: 0.2s">.</span>
      </div>
    </div>
  {/each}
</div>
