<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import { enhance } from '$app/forms'
  import InputGroup from './InputGroup.svelte'

  export let userTeam: any
  export let team: any
  export let form: any
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
      name="openAiApiKey"
      placeholder="OpenAI API Key"
      disabled={userTeam.role === 'MEMBER'}
      value={form?.fields?.openAiApiKey ?? team.openAiApiKey}
      errors={form?.errors?.openAiApiKey}
    />
    <Input
      class="dark col-span-full"
      name="name"
      placeholder="Name"
      disabled={userTeam.role === 'MEMBER'}
      value={form?.fields?.name ?? team.name}
      errors={form?.errors?.name}
    />
  </InputGroup>
</form>
