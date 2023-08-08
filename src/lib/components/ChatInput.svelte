<script lang="ts">
  import { enhance } from '$app/forms'
  import { ArrowPathIcon, PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher, afterUpdate } from 'svelte'
  import autosize from 'svelte-autosize'

  export let role: string | null
  export let chatId: number | undefined

  let text = ''
  let isShiftPressed = false
  let loading = false
  let chatForm: HTMLFormElement
  const dispatch = createEventDispatcher()

  function dispatchMessage() {
    loading = true

    if (text) {
      dispatch('message', text)
      text = ''
    }
  }

  let textareaRef: HTMLTextAreaElement
  afterUpdate(() => {
    textareaRef.focus()
  })
</script>

<form
  method="POST"
  action="?/sendMessage"
  novalidate
  bind:this={chatForm}
  use:enhance={() => {
    dispatchMessage()

    return async ({ update }) => {
      await update()
      loading = false
      textareaRef.focus()
    }
  }}
>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full flex justify-center">
      <div class="flex w-5/6 max-w-5xl shadow-xl">
        <div class="flex justify-centermin-h-[4rem] w-full bg-primary rounded-l-xl">
          <textarea
            bind:this={textareaRef}
            rows="1"
            name="message"
            bind:value={text}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                if (!isShiftPressed) {
                  dispatchMessage()
                  chatForm.requestSubmit()
                  e.preventDefault()
                }
              } else if (e.key === 'Shift') isShiftPressed = true
            }}
            on:keyup={(e) => {
              if (e.key === 'Shift') isShiftPressed = false
            }}
            placeholder="Type your message"
            class="no-border w-full items-center my-auto resize-none m-2 placeholder-white placeholder-opacity-50 bg-primary text-white max-h-96"
            use:autosize
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
  {#if role}
    <input type="hidden" name="role" value={role} />
  {/if}
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
