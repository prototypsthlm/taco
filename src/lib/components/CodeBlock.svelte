<script lang="ts">
  import { onMount } from 'svelte';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/atom-one-dark.css';
  import type { Tokens } from 'marked';
  import { Square2StackIcon } from '@babeard/svelte-heroicons/solid';

  export let token: Tokens.Code;

  let codeElement: HTMLElement;

  function copyToClipboard() {
    navigator.clipboard.writeText(token.text)
  }

  onMount(() => {
    if (codeElement) {
      hljs.highlightElement(codeElement);
    }
  });
</script>

<div class="relative">
  <button class="absolute top-2 right-2 bg-gray-800 text-white p-1 rounded" on:click={copyToClipboard} aria-label="Copy">
    <Square2StackIcon class="w-5 h-5 text-white" aria-hidden="true" />
  </button>
  <pre class="lang-{token.lang}"><code bind:this={codeElement}>{token.text}</code></pre>
</div>

<style>
  .relative {
    position: relative;
  }
  .absolute {
    position: absolute;
  }
  .top-2 {
    top: 0.5rem;
  }
  .right-2 {
    right: 0.5rem;
  }
  .bg-gray-800 {
    background-color: #2d3748;
  }
  .text-white {
    color: #fff;
  }
  .p-1 {
    padding: 0.25rem;
  }
  .rounded {
    border-radius: 0.25rem;
  }
  pre {
    background-color: #282c34;
    color: #abb2bf;
    padding: 1rem;
    border-radius: 0.25rem;
  }
  .w-5 {
    width: 1.25rem;
  }
  .h-5 {
    height: 1.25rem;
  }
</style>