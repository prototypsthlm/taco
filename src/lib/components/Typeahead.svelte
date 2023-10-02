<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { Suggestion } from '$lib/types'

  export let inputValue = ''
  export let name: string
  export let id: string
  export let placeholder: string
  export let ariaDescribedby: string
  export let input: HTMLInputElement
  export let suggestions: Suggestion[] = []
  let filteredSuggestions: Suggestion[] = []
  let activeSuggestionIndex: number | null = null
  let isInputFocused = false // Track if input is focused
  export let errors: string[] | undefined

  const selectSuggestion = (index: number) => {
    if (filteredSuggestions[index]) {
      inputValue = filteredSuggestions[index].email
    }
  }

  const filterSuggestions = () => {
    if (!inputValue) {
      filteredSuggestions = suggestions
    } else {
      // Filter the suggestions
      filteredSuggestions = suggestions.filter(
        (s) =>
          s.email.toLowerCase().includes(inputValue.toLowerCase()) ||
          s.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    console.log({ e })
    if (e.key === 'Enter' && activeSuggestionIndex !== null) {
      e.preventDefault() // Prevent form from submitting TODO:remove so we can submit on enter
      selectSuggestion(activeSuggestionIndex)
      return
    }
    if (activeSuggestionIndex === null) return

    switch (e.key) {
      case 'ArrowDown':
        if (activeSuggestionIndex < filteredSuggestions.length - 1) {
          activeSuggestionIndex++
        }
        break
      case 'ArrowUp':
        if (activeSuggestionIndex > 0) {
          activeSuggestionIndex--
        }
        break
    }
  }

  $: {
    if (!inputValue) {
      filteredSuggestions = suggestions
    } else {
      filteredSuggestions = suggestions.filter(
        (s) =>
          s.email.toLowerCase().includes(inputValue.toLowerCase()) ||
          s.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    }
  }
</script>

<Input
  {id}
  class={$$props.class}
  aria-describedby={ariaDescribedby}
  type="text"
  {placeholder}
  bind:value={inputValue}
  {name}
  on:input={filterSuggestions}
  on:keydown={(e) => handleKeydown(e.detail)}
  on:focus={() => (isInputFocused = true)}
  on:blur={() => setTimeout(() => (isInputFocused = false), 200)}
  bind:input
  {errors}
  noLabel={true}
/>
{#if isInputFocused && filteredSuggestions.length}
  <ul
    class="absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
  >
    {#each filteredSuggestions as suggestion, index}
      <li
        class="block text-gray-900 relative cursor-pointer select-none py-2 pl-3 pr-9 {activeSuggestionIndex ===
        index
          ? 'bg-indigo-600 text-white'
          : ''}"
        on:click={() => selectSuggestion(index)}
        on:keydown={handleKeydown}
        on:mouseover={() => (activeSuggestionIndex = index)}
        on:focus={() => (activeSuggestionIndex = index)}
      >
        <div class="flex gap-2">
          <Gravatar class="h-5 w-5 flex-shrink-0 rounded-full" value={suggestion.email} />
          <span class="truncate">{suggestion.name}</span>
          <span
            class="{activeSuggestionIndex === index ? 'text-indigo-200' : 'text-gray-500'} truncate"
            >{suggestion.email}</span
          >
        </div>
      </li>
    {/each}
  </ul>
{/if}
