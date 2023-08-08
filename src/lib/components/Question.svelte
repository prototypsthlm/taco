<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import { markdownToHtml } from '$lib/utils/markdown'

  export let text: string
  export let authorEmail: string
</script>

<div class="flex items-center gap-4 md:gap-8 w-full p-4 md:p-8">
  <div
    class="flex-shrink-0 h-10 w-10 text-accent bg-blue-600 rounded-xl overflow-hidden flex items-center justify-center"
  >
    <Gravatar value={authorEmail} />
  </div>
  <div class="max-w-5xl text-accent prose prose-invert">
    {#await markdownToHtml(text) then parsedText}
      {@html parsedText}
    {/await}
  </div>
</div>
