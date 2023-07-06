<script lang="ts">
  import { enhance } from '$app/forms'
  import { ArrowPathIcon, PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'

  import { createEventDispatcher } from 'svelte'

  export let chatId: number | null
  let text: string = ''
  let isShiftPressed: boolean = false
  let loading: boolean = false

  const dispatch = createEventDispatcher()

  function dispatchMessage() {
    loading = true

    if (text) {
      dispatch('message', text)
      text = ''
    }
  }

  function handleTextAreaSize(eventTarget: EventTarget | null) {
    const textarea = eventTarget as HTMLTextAreaElement
    if (textarea.scrollHeight <= 500) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }
</script>

<form
  id="chat-input"
  method="POST"
  action="?/sendMessage"
  novalidate
  use:enhance={() => {
    dispatchMessage()

    return async ({ update }) => {
      await update()
      loading = false
    }
  }}
>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full flex justify-center">
      <div class="flex w-5/6 max-w-5xl shadow-xl">
        <div class="flex justify-centermin-h-[4rem] w-full bg-primary rounded-l-xl">
          <textarea
            rows="1"
            name="message"
            bind:value={text}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                if (!isShiftPressed) {
                  dispatchMessage()
                  document.getElementById('chat-input')?.submit()
                  e.preventDefault()
                } else handleTextAreaSize(e.target)
              } else if (e.key === 'Shift') isShiftPressed = true
            }}
            on:keyup={(e) => {
              if (e.key === 'Shift') isShiftPressed = false
            }}
            placeholder="Type your message"
            class="no-border w-full items-center my-auto resize-none m-2 text-xl placeholder-white placeholder-opacity-50 bg-primary text-white"
          />
        </div>
        <button disabled={loading} class="p-3 pr-14 w-12 rounded-r-xl bg-primary group">
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
  {#if chatId}
    <input type="hidden" name="chatId" value={chatId} />
  {/if}
</form>

<style>
  .no-border {
    appearance: none;
    border: none;
    outline: none;
    box-shadow: none;
  }
</style>
