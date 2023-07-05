<script lang="ts">
  import { PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'

  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  function dispatchMessage() {
    if (text) {
      dispatch('message', text)
    }
  }

  function handleTextAreaSize(inputEvent: any) {
    const textarea = inputEvent.target as HTMLTextAreaElement
    if (textarea.scrollHeight <= 500) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }

  let text: string = ''
</script>

<div class="w-full flex justify-center">
  <div class="flex w-5/6 max-w-6xl shadow-xl">
    <div class="flex justify-centermin-h-[4rem] w-full bg-primary rounded-l-xl">
      <textarea
        rows="1"
        name="message"
        bind:value={text}
        on:input={handleTextAreaSize}
        placeholder="Type your message"
        class="no-border w-full items-center my-auto resize-none m-4 text-2xl placeholder-white placeholder-opacity-50 bg-primary text-white"
      />
    </div>
    <button on:click={dispatchMessage} class="p-4 pr-14 w-16 rounded-r-xl bg-primary group">
      <PaperAirplaneIcon class="text-white h-10 w-10 opacity-40 group-hover:opacity-95 duration-200" />
    </button>
  </div>
</div>

<style>
  .no-border {
    appearance: none;
    border: none;
    outline: none;
    box-shadow: none;
  }
</style>
