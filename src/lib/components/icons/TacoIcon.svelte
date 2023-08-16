<script lang="ts">
  import logo from '$lib/assets/logo.png'

  export let showText = true
  export let dark = false
</script>

<div class="flex gap-6 items-center justify-center">
  <img class="{$$props.class} {dark ? 'invert': 'invert-0'}" src={logo} alt="TACO Logo" />
  {#if showText}
    <span class="font-bold {dark ? 'text-black': 'text-accent'}"> T A C O </span>
  {/if}
</div>
