<script lang="ts">
  export let href: string;
  export let text: string;
</script>


<a href={href} class="p-4 text-2xl font-bold text-accent rounded-xl hover:scale-105 duration-200 bg-primary">
  {text}
</a>