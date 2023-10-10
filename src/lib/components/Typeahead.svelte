<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { Suggestion } from '$lib/types'

  export let value = ''
  export let name: string
  export let id: string
  export let placeholder: string
  export let ariaDescribedby: string
  export let suggestions: Suggestion[] = []
  let filteredSuggestions: Suggestion[] = suggestions
  let activeSuggestionIndex: number | null = null
  let isInputFocused = false // Track if input is focused
  export let errors: string[] | undefined
  let suggestionElements: HTMLElement[] = []

  const selectSuggestion = (index: number) => {
    if (filteredSuggestions[index]) {
      value = filteredSuggestions[index].email
    }
  }

  const filterSuggestions = (e: CustomEvent) => {
    value = e.detail.target.value
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && activeSuggestionIndex !== null) {
      e.preventDefault()
      selectSuggestion(activeSuggestionIndex)
      return
    }

    if (activeSuggestionIndex === null) {
      if (e.key === 'ArrowDown') {
        activeSuggestionIndex = 0
      } else if (e.key === 'ArrowUp') {
        activeSuggestionIndex = filteredSuggestions.length - 1
      }
      return
    }

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
    scrollToActiveSuggestion()
  }

  function scrollToActiveSuggestion() {
    if (activeSuggestionIndex === null) return
    const activeElement = suggestionElements[activeSuggestionIndex]
    if (activeElement?.parentElement) {
      const container: HTMLElement = activeElement.parentElement
      const containerTop = container.scrollTop
      const containerBottom = containerTop + container.clientHeight
      const elementTop = activeElement.offsetTop
      const elementBottom = elementTop + activeElement.clientHeight

      if (elementTop < containerTop) {
        container.scrollTop = elementTop
      } else if (elementBottom > containerBottom) {
        container.scrollTop = elementBottom - container.clientHeight
      }
    }
  }

  $: {
    if (!value) {
      filteredSuggestions = suggestions
    } else {
      filteredSuggestions = suggestions.filter(
        (s) =>
          s.email.toLowerCase().includes(value.toLowerCase()) ||
          s.name.toLowerCase().includes(value.toLowerCase())
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
  bind:value
  {name}
  on:input={filterSuggestions}
  on:keydown={(e) => handleKeydown(e.detail)}
  on:focus={() => (isInputFocused = true)}
  on:blur={() => setTimeout(() => (isInputFocused = false), 200)}
  {errors}
  noLabel={true}
/>

{#if isInputFocused && filteredSuggestions.length}
  <ul
    class="absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
    role="listbox"
  >
    {#each filteredSuggestions as suggestion, index}
      <li
        bind:this={suggestionElements[index]}
        class="block text-gray-900 relative cursor-pointer select-none py-2 pl-3 pr-9 {activeSuggestionIndex ===
        index
          ? 'bg-indigo-600 text-white'
          : ''}"
        on:click={() => selectSuggestion(index)}
        on:keydown={handleKeydown}
        on:mouseover={() => (activeSuggestionIndex = index)}
        on:focus={() => {
          isInputFocused = true
          activeSuggestionIndex = 0
        }}
        role="option"
        aria-selected={activeSuggestionIndex === index ? 'true' : 'false'}
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
