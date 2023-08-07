<script lang="ts">
  import { markdownToHtml } from '$lib/utils/markdown'
  import md5 from 'crypto-js/md5'

  export let text: string
  export let authorEmail: string
</script>

<div class="flex items-center gap-4 md:gap-8 w-full p-4 md:p-8">
  <div
    class="flex-shrink-0 h-10 w-10 text-accent bg-blue-600 rounded-xl flex items-center justify-center"
  >
    <img
      class="h-10 w-10 rounded-xl"
      src={`https://www.gravatar.com/avatar/${md5(authorEmail)}?d=identicon`}
      alt=""
    />
  </div>
  <div class="max-w-5xl text-accent prose prose-invert">
    {#await markdownToHtml(text) then parsedText}
      {@html parsedText}
    {/await}
  </div>
</div>
