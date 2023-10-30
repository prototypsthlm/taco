<script lang="ts">
  import UsersTyping from '$lib/components/UsersTyping.svelte'
  import type { ChatWithRelations } from '$lib/server/entities/chat'
  import { Models } from '$lib/types/models'
  import { ArrowPathIcon, PaperAirplaneIcon } from '@babeard/svelte-heroicons/solid'
  import { createEventDispatcher, onMount, tick } from 'svelte'
  import autosize from 'svelte-autosize'
  import ChatSettingsPopover from './ChatSettingsPopover.svelte'

  export let chat: ChatWithRelations | undefined = undefined
  export let availableModels: string[]
  export let loading = false

  let model = chat?.model || Models.gpt3
  let temperature = Number(chat?.temperature) || 0.6
  export let question = ''
  let isShiftPressed = false
  const dispatch = createEventDispatcher()

  function changeModel(event: { detail: any }) {
    if (loading) return
    model = event.detail
  }
  function changeTemperature(event: { detail: any }) {
    if (loading) return
    temperature = event.detail
  }

  function dispatchMessage() {
    if (question.trim() && !loading) {
      dispatch('message', { question, model, temperature })
      reset()
    }
  }

  let textarea: HTMLTextAreaElement
  onMount(() => {
    textarea.focus()
  })

  async function reset() {
    await tick()
    autosize.update(textarea)
  }

  $: if (question === '') {
    reset()
  }

  let oldChat: ChatWithRelations | undefined = undefined
  $: if (chat !== oldChat) {
    model = chat?.model || Models.gpt3
    temperature = Number(chat?.temperature) || 0.9
    oldChat = chat
  }
</script>

<div class={$$props.class}>
  <div class="relative">
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
              class="border-0 focus:ring-0 w-full items-center my-auto resize-none m-2 placeholder-white placeholder-opacity-50 bg-primary text-white max-h-96"
              use:autosize
              on:focus={() => {
                dispatch('focus')
              }}
              on:blur={() => {
                dispatch('blur')
              }}
            />
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

      <!-- Chat settings button. -->
      <div class="ml-2" />
      <ChatSettingsPopover
        {model}
        {availableModels}
        {temperature}
        {loading}
        on:changeModel={changeModel}
        on:changeTemperature={changeTemperature}
      />
    </div>
    <div class="w-5/6 max-w-5xl flex justify-between gap-4 text-accent text-opacity-50 text-xs">
      <UsersTyping />
    </div>
  </div>
</div>
