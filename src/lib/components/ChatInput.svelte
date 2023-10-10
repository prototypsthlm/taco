<script lang="ts">
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { Models } from '$lib/types/models'
  import { ArrowPathIcon, PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'
  import ListBullet from '@babeard/svelte-heroicons/solid/ListBullet'
  import { afterUpdate, createEventDispatcher, onMount } from 'svelte'
  import UsersTyping from '$lib/components/UsersTyping.svelte'
  import { ArrowPathIcon, PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher, onMount } from 'svelte'
  import autosize from 'svelte-autosize'

  // Variables got from <ChatInput {chat} {loading} on:message={handleSubmit} />
  export let chat: ChatWithRelations | undefined = undefined
  export let loading = false

  let model = chat?.model // Get the last session selected model
  let question = ''
  let isShiftPressed = false
  const dispatch = createEventDispatcher() // Events created this way are handled by the handleSubmit function in 'ChatRoom.svelte'.

  function dispatchMessage() {
    // Actually dispatch message.
    if (question.trim() && !loading) {
      dispatch('message', { question, model })
      question = '' // Empty any written text as it has already been sent, we do NOT do so with the model, which remains the same.
    }
  }

  function chooseMessageSettings() {
    if (loading) return
    if (model == Models.gpt3) {
      model = Models.gpt4
    } else {
      model = Models.gpt3
    }
    console.log('Selected model: ' + model)
  }

  let textarea: HTMLTextAreaElement
  onMount(() => {
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
            // Keyboard input handling.
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
          on:focus={() => {
            dispatch('focus')
          }}
          on:blur={() => {
            dispatch('blur')
          }}
        />
      </div>

      <!-- Chat-GPT4 toggle. -->
      <div class="flex flex-col items-center p-3 pr-14 w-0 bg-primary">
        <span class="pr-2 ml-3 text-white">GPT4</span>
        <button
          on:click={chooseMessageSettings}
          disabled={loading}
          type="button"
          class="{model === Models.gpt4
            ? 'bg-indigo-600'
            : 'bg-gray-200'} inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          role="switch"
          aria-checked="false"
        >
          <span class="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            class="{model === Models.gpt4
              ? 'translate-x-5'
              : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          />
        </button>
      </div>

      <!-- Send message button. -->
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
  <div class="w-5/6 max-w-5xl flex justify-between gap-4 text-accent text-opacity-50 text-xs">
    <UsersTyping />
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
