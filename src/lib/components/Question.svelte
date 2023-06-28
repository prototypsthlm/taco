<script lang="ts">
  export let text: string
  export let author: string

  $: authorShorthand = author?.toUpperCase().slice(0, 2) || '??'
</script>

<div class="flex items-center gap-4 md:gap-8 w-full p-4 md:p-8">
  <p class="text-2xl h-12 w-12 text-center p-2 text-accent bg-blue-950 rounded-xl">
    {authorShorthand}
  </p> 
  <p class="max-w-5xl text-xl text-accent">
    {text}
  </p> 
</div>