<script lang="ts">
  import { onMount } from 'svelte';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/atom-one-dark.css';
  import type { Tokens } from 'marked';
  import { Square2StackIcon } from '@babeard/svelte-heroicons/solid';

  export let token: Tokens.Code;

  let codeElement: HTMLElement;

  function copyToClipboard() {
    navigator.clipboard.writeText(token.text);
  }

  onMount(() => {
    if (codeElement) {
      hljs.highlightElement(codeElement);
    }
  });
</script>

<div class="relative">
  <div class="header-bar flex justify-between items-center px-3 py-3">
    <div class="text-xs">
      {token.lang || 'plaintext'}
    </div>

      <button class="flex items-center text-gray-500 hover:text-white p text-xs" on:click={copyToClipboard} aria-label="Copy">
        <Square2StackIcon class="w-4 h-4 mr-2" aria-hidden="true" />
        Copy code
      </button>
  </div>
  <pre class="lang-{token.lang}"><code bind:this={codeElement}>{token.text}</code></pre>
</div>

<style>
  .relative {
    position: relative;
  }
  .header-bar {
    background-color: #1f2937; /* Different color from the code block */
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  .text-xs {
    font-size: 0.75rem;
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
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    margin-top: 0; /* Remove margin between header and code block */
  }
  .w-5 {
    width: 1.25rem;
  }
  .h-5 {
    height: 1.25rem;
  }
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .items-center {
    align-items: center;
  }
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
</style>