<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'

  export let emails: string[] = []
</script>

{#if emails.length}
  <div class="{$$restProps?.class} flex-shrink-0 flex -space-x-1 overflow-hidden relative">
    {#each emails as email}
      <Gravatar
        title={email}
        class="w-5 rounded-full overflow-hidden ring-2 ring-[#262e3c]"
        value={email}
      />
      <span
        class="absolute bottom-0.5 left-1.5 block h-1 w-1 rounded-full bg-red-400 ring-1 ring-white"
      />
    {/each}
  </div>
{/if}
