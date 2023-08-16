<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import { enhance } from '$app/forms'

  export let userTeam: any
  export let team: any
  export let form: any
</script>

<div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
  <div>
    <h2 class="text-base font-semibold leading-7 text-white">Open AI API Key</h2>
    <p class="mt-1 text-sm leading-6 text-gray-400">The key shared with the team</p>
  </div>

  <form
    method="post"
    action="?/updateTeamDetails"
    class="md:col-span-2"
    use:enhance={() => {
      return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
    }}
  >
    <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
      <div class="col-span-full">
        <Input
          class="dark"
          name="openAiApiKey"
          placeholder="OpenAI API Key"
          disabled={userTeam.role === 'MEMBER'}
          value={form?.fields?.openAiApiKey ?? team.openAiApiKey}
          errors={form?.errors?.openAiApiKey}
        />
      </div>

      <div class="col-span-full">
        <Input
          class="dark"
          name="name"
          placeholder="Name"
          disabled={userTeam.role === 'MEMBER'}
          value={form?.fields?.name ?? team.name}
          errors={form?.errors?.name}
        />
      </div>
    </div>

    <div class="mt-8 flex">
      <button
        type="submit"
        disabled={userTeam.role === 'MEMBER'}
        class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >Save</button
      >
      <Alert
        class="ml-4"
        type={(form?.error && 'error') || (form?.success && 'success')}
        message={form?.error || form?.success}
      />
    </div>
  </form>
</div>
