<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import { enhance } from '$app/forms'
  import InputGroup from '$lib/components/InputGroup.svelte'

  export let userTeam: any
  export let team: any
  export let form: any

  let testApiKey: string = team.openAiApiKey
  let statusCodeMessage: string = ''
  let isLoading: boolean
  async function testOpenAiApiKey() {
    isLoading = true
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say this is a test!' }],
          temperature: 0.7,
        }),
      })
      if (response.status === 200) {
        statusCodeMessage = 'API key is valid.'
      } else {
        statusCodeMessage = `API key is invalid or has insufficient permissions. Status code: ${response.status}.`
      }
    } catch (error) {
      statusCodeMessage = 'An error occurred while testing the API key.'
    } finally {
      isLoading = false
    }
  }
</script>

<form
  method="post"
  action="?/updateTeamDetails"
  use:enhance={() => {
    return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
  }}
>
  <InputGroup
    header="Team Details"
    description="The API keys and the Team name which is a unique identifier"
    {form}
  >
    <Input
      class="dark col-span-full"
      name="name"
      placeholder="Name"
      disabled={userTeam.role === 'MEMBER'}
      value={form?.fields?.name ?? team.name}
      errors={form?.errors?.name}
    />
    <Input
      class="dark col-span-full"
      name="openAiApiKey"
      label="OpenAI API Key"
      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      disabled={userTeam.role === 'MEMBER'}
      value={form?.fields?.openAiApiKey ?? team.openAiApiKey}
      errors={form?.errors?.openAiApiKey}
      on:input={(event) => {
        testApiKey = event.detail.target?.value
      }}
    />
    <div class="col-span-full flex gap-4 items-center">
      <button
        on:click={() => {
          testOpenAiApiKey()
        }}
        type="button"
        disabled={isLoading}
        class="flex rounded-md bg-indigo-500 px-2 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:bg-indigo-300"
      >
        {#if isLoading}
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Testing
        {:else}
          Test Key
        {/if}
      </button>
      <div class="text-sm leading-6 text-gray-400">{statusCodeMessage}</div>
    </div>
    <Input
      class="dark col-span-full"
      name="ollamaBaseUrl"
      label="Ollama Base URL"
      placeholder="https://some-ollama-server.app"
      disabled={userTeam.role === 'MEMBER'}
      value={form?.fields?.ollamaBaseUrl ?? team.ollamaBaseUrl}
      errors={form?.errors?.ollamaBaseUrl}
    />
  </InputGroup>
</form>
