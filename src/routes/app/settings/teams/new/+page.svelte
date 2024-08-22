<script lang="ts">
  import { enhance } from '$app/forms'
  import Input from '$lib/components/Input.svelte'
  import InputGroup from '$lib/components/InputGroup.svelte'
  import type { ActionData } from './$types'

  export let form: ActionData
</script>

<form
  method="post"
  action="?/createTeam"
  novalidate
  use:enhance={() => {
    return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
  }}
>
  <InputGroup
    header="Create a new Team"
    description={`You need an OpenAI API key to create a team. You can get one at <a href="https://platform.openai.com" target="_blank" class="text-blue-500 underline hover:text-blue-700">https://platform.openai.com</a>`}
    {form}
  >
    <Input
      value={form?.fields?.name}
      errors={form?.errors?.name}
      label="Name*"
      id="name"
      name="name"
      type="text"
      class="dark col-span-full"
      placeholder=""
    />

    <Input
      value={form?.fields?.openAiApiKey}
      errors={form?.errors?.openAiApiKey}
      label="OpenAI API Key*"
      id="openAiApiKey"
      name="openAiApiKey"
      type="text"
      class="dark col-span-full"
      placeholder=""
    />

    <Input
      value={form?.fields?.ollamaBaseUrl}
      errors={form?.errors?.ollamaBaseUrl}
      label="Ollama Base URL"
      id="ollamaBaseUrl"
      name="ollamaBaseUrl"
      type="text"
      class="dark col-span-full"
      placeholder=""
    />
  </InputGroup>
</form>
