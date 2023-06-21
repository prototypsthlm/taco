<script lang="ts">
  import Send from 'svelte-material-icons/Send.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();

  function dispatchMessage() {
    if (text) {
      dispatch('message', text);
      text = '';
    }
  }

  onMount(() => {
    if (!browser) return;

    const textarea: HTMLTextAreaElement = document.getElementById(
      'inputTextArea'
    ) as HTMLTextAreaElement;

    if (textarea) {
      textarea.addEventListener('input', () => {
        if (textarea.scrollHeight <= 500) {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }
      });
    }
  });

  let text: string = '';
</script>

<div class="w-full flex justify-center">
  <div class="flex w-5/6 max-w-6xl">
    <textarea
      id="inputTextArea"
      rows="1"
      bind:value={text}
      placeholder="Type your message"
      class="w-full p-4 appearance-none text-2xl bg-gray-600 focus:outline-none rounded-l-xl text-white"
    />
    <button on:click={dispatchMessage} class="p-4 pr-14 w-16 rounded-r-xl bg-gray-600 group">
      <Send class="text-white h-10 w-10 opacity-40 group-hover:opacity-95 duration-200" />
    </button>
  </div>
</div>
