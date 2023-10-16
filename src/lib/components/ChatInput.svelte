<script lang="ts">
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { Models } from '$lib/types/models'
  import { ArrowPathIcon, PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'
  import ListBullet from '@babeard/svelte-heroicons/solid/ListBullet'
  import UsersTyping from '$lib/components/UsersTyping.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import autosize from 'svelte-autosize'

  // Variables got from <ChatInput {chat} {loading} on:message={handleSubmit} />
  export let chat: ChatWithRelations | undefined = undefined
  export let loading = false

  let model = chat?.model || Models.gpt3 // Get the last session selected model
  let question = ''
  // let chatSettingsAreVisible = true
  let isShiftPressed = false
  const dispatch = createEventDispatcher() // Events created this way are handled by the handleSubmit function in 'ChatRoom.svelte'.

  function chooseMessageSettings() {
    if (loading) return
    if (model == Models.gpt3) {
      model = Models.gpt4
    } else {
      model = Models.gpt3
    }
    console.log('Selected model: ' + model)
  }

  // function showChatSettings() {
  //   chatSettingsAreVisible = true
  // }
  // function hideChatSettings() {
  //   chatSettingsAreVisible = false
  // }

  function dispatchMessage() {
    // Actually dispatch message.
    if (question.trim() && !loading) {
      dispatch('message', { question, model })
      question = '' // Empty any written text as it has already been sent, we do NOT do so with the model, which remains the same.
    }
  }

  let textarea: HTMLTextAreaElement
  onMount(() => {
    textarea.focus()
  })
</script>

<div class="relative">
  <!-- Main Screen Content -->
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
        <div class="flex flex-col items-center justify-center bg-primary pb-1">
          <span class="text-white">GPT4</span>
          <button
            on:click={chooseMessageSettings}
            disabled={loading}
            type="button"
            class="{model === Models.gpt4
              ? 'bg-indigo-600'
              : 'bg-gray-200'} inline-flex h-4 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            role="switch"
            aria-checked="false"
          >
            <span class="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              class="{model === Models.gpt4
                ? 'translate-x-5'
                : 'translate-x-0'} pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            />
          </button>
        </div>

        <!-- Chat settings button. -->
        <!-- <button on:click={showChatSettings} disabled={loading} class="bg-primary group">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 text-white opacity-40"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button> -->

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

  <!-- <div
    class="{chatSettingsAreVisible
      ? ''
      : 'hidden'} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white shadow sm:rounded-lg"
  >
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-6 text-gray-900" id="renew-subscription-label">
          Chat Settings
        </h3>

        <div class="mt-2 sm:flex sm:items-start sm:justify-between">
          <div class="max-w-xl text-sm text-gray-500">
            <p>Use chatGPT4</p>
          </div>
          <div class="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
            <button
              on:click={chooseMessageSettings}
              disabled={loading}
              type="button"
              class="{model === Models.gpt4
                ? 'bg-indigo-600'
                : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              role="switch"
              aria-checked="false"
              aria-labelledby="renew-subscription-label"
              aria-describedby="renew-subscription-description"
            >
              <span
                aria-hidden="true"
                class="{model === Models.gpt4
                  ? 'translate-x-5'
                  : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              />
            </button>
          </div>
        </div>
      </div>
    </div> 
  </div> -->
</div>

<style>
  .no-border {
    appearance: none;
    border: none;
    outline: none;
    box-shadow: none;
  }
</style>
