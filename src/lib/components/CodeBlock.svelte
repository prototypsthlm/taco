<script lang="ts">
  import hljs from 'highlight.js'
  import 'highlight.js/styles/atom-one-dark.css'
  import type { Tokens } from 'marked'
  import { Square2StackIcon } from '@babeard/svelte-heroicons/solid'

  export let token: Tokens.Code

  let codeElement: HTMLElement

  function copyToClipboard() {
    navigator.clipboard.writeText(token.text)
  }

  $: if (token && codeElement) {
    const result = hljs.highlight(token.text, { language: token.lang || 'plaintext' })
    codeElement.innerHTML = result.value
  }
</script>

<div>
  <div class="bg-gray-700 rounded-t-md flex justify-between items-center px-3 py-2">
    <div class="text-xs text-white">
      {token.lang || 'plaintext'}
    </div>
    <button
      class="flex items-center text-gray-400 hover:text-white text-xs"
      on:click={copyToClipboard}
      aria-label="Copy"
    >
      <Square2StackIcon class="w-4 h-4 mr-1" aria-hidden="true" />
      Copy code
    </button>
  </div>
  <pre class="bg-gray-800 text-gray-300 p-4 rounded-b-md m-0" bind:this={codeElement}>
    <code>
      {token.text}
    </code>
  </pre>
</div>
