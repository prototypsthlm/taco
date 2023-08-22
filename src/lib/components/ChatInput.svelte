<script lang="ts">
  import { ArrowPathIcon, PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'
  import { afterUpdate, createEventDispatcher, onMount } from 'svelte'
  import autosize from 'svelte-autosize'

  let question = ''
  let isShiftPressed = false
  export let loading = false
  const dispatch = createEventDispatcher()

  function dispatchMessage() {
    if (question.trim() && !loading) {
      dispatch('message', { question })
      question = ''
    }
  }

  let textarea: HTMLTextAreaElement
  onMount(() => {
    textarea.focus()
  })
  afterUpdate(() => {
    textarea.focus()
  })
</script>

<div class="flex flex-col items-center gap-1">
  <div class="w-full flex justify-center">
    <div class="flex w-5/6 max-w-5xl shadow-xl">
      <div class="flex justify-centermin-h-[4rem] w-full bg-primary rounded-l-xl">
        <textarea
          bind:this={textarea}
          rows="1"
          name="message"
          bind:value={question}
          on:keydown={(e) => {
            if (e.key === 'Enter' && !isShiftPressed) {
              dispatchMessage()
              e.preventDefault()
            } else if (e.key === 'Shift') {
              isShiftPressed = true
            }
          }}
          on:keyup={(e) => {
            if (e.key === 'Shift') {
              isShiftPressed = false
            }
          }}
          placeholder="Type your message"
          class="no-border w-full items-center my-auto resize-none m-2 placeholder-white placeholder-opacity-50 bg-primary text-white max-h-96"
          use:autosize
          on:focus={() => dispatch('focus')}
        />
      </div>
      <button
        on:click={dispatchMessage}
        disabled={loading}
        class="p-3 pr-14 w-12 rounded-r-xl bg-primary group"
      >
        {#if !loading}
          <PaperAirplaneIcon
            class="text-white h-8 w-10 opacity-40 group-hover:opacity-95 duration-200"
          />
        {:else}
          <ArrowPathIcon class="h-8 w-10 text-white animate-spin" />
        {/if}
      </button>
    </div>
  </div>
  <p class="text-accent text-opacity-50">Press <strong> Shift + Enter </strong> for a new line</p>
</div>

<style>
  .no-border {
    appearance: none;
    border: none;
    outline: none;
    box-shadow: none;
  }
</style>
