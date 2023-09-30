<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import type { Suggestion } from '$lib/types'

  export let inputValue = ''
  export let name: string
  export let label: string
  export let placeholder: string
  export let input: HTMLInputElement
  export let suggestions: Suggestion[] = []
  let filteredSuggestions: Suggestion[] = []
  let activeSuggestionIndex: number | null = null
  let selectedEmails: string[] = []
  let isInputFocused = false // Track if input is focused

  const selectSuggestion = (index: number) => {
    if (filteredSuggestions[index]) {
      selectedEmails = [...selectedEmails, filteredSuggestions[index].email]
      inputValue = ''
    }
  }

  const filterSuggestions = () => {
    if (!inputValue) {
      filteredSuggestions = suggestions.filter((s) => !selectedEmails.includes(s.email)) // Remove already selected emails
    } else {
      // Filter the suggestions
      filteredSuggestions = suggestions.filter(
        (s) =>
          (s.email.toLowerCase().includes(inputValue.toLowerCase()) ||
            s.name.toLowerCase().includes(inputValue.toLowerCase())) &&
          !selectedEmails.includes(s.email) // Remove already selected emails
      )
    }
  }

  const removeEmail = (email: string) => {
    selectedEmails = selectedEmails.filter((e) => e !== email)
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && activeSuggestionIndex !== null) {
      e.preventDefault() // Prevent form from submitting
      selectSuggestion(activeSuggestionIndex)
      return
    }

    // New else block: Handle case when 'Enter' is pressed but no suggestion is selected
    else if (e.key === 'Enter') {
      e.preventDefault() // Prevent form from submitting
      if (inputValue && inputValue.trim() !== '') {
        // Validate that input is not empty
        selectedEmails = [...selectedEmails, inputValue.trim()] // Add the current input value
        inputValue = '' // Clear the input field
      }
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
      filteredSuggestions = suggestions.filter((s) => !selectedEmails.includes(s.email))
    } else {
      filteredSuggestions = suggestions.filter(
        (s) =>
          (s.email.toLowerCase().includes(inputValue.toLowerCase()) ||
            s.name.toLowerCase().includes(inputValue.toLowerCase())) &&
          !selectedEmails.includes(s.email)
      )
    }
  }

  // Reactively update filtered suggestions based on changes in selectedEmails
  $: if (selectedEmails) {
    filteredSuggestions = filteredSuggestions.filter((s) => !selectedEmails.includes(s.email))
  }
</script>

<input {name} type="hidden" value={selectedEmails.join(',')} />
<div>
  {#if selectedEmails.length}
    <div class="flex flex-wrap gap-2 mb-4">
      {#each selectedEmails as email}
        <span
          class="inline-flex items-center gap-x-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
        >
          {email}
          <button class="ml-2" on:click|preventDefault={() => removeEmail(email)}> x </button>
        </span>
      {/each}
    </div>
  {/if}

  <div class="{$$props.class} space-y-2">
    <label for="add-team-members" class="block text-sm font-medium leading-6 text-gray-900"
      >{label}</label
    >
    <p id="add-team-members-helper" class="sr-only">Search by email address</p>
    <div class="flex">
      <div class="flex-grow">
        <input
          id="add-team-members"
          class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
          aria-describedby="add-team-members-helper"
          type="text"
          {placeholder}
          bind:value={inputValue}
          name="_typeahead_aux"
          on:input={filterSuggestions}
          on:keydown={handleKeydown}
          on:focus={() => (isInputFocused = true)}
          on:blur={() => setTimeout(() => (isInputFocused = false), 200)}
          bind:this={input}
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
                    class="{activeSuggestionIndex === index
                      ? 'text-indigo-200'
                      : 'text-gray-500'} truncate">{suggestion.email}</span
                  >
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      <span class="ml-3">
        <button
          type="button"
          class="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <svg
            class="-ml-0.5 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
            />
          </svg>
          Add
        </button>
      </span>
    </div>
  </div>
</div>
