<script lang="ts">
  import { enhance } from '$app/forms'
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { ActionData } from './$types'

  export let form: ActionData
</script>

<div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
  <div>
    <h2 class="text-base font-semibold leading-7 text-white">Create a new Team</h2>
    <p class="mt-1 text-sm leading-6 text-gray-400">
      You can also specify the api key later in the settings.
    </p>
  </div>

  <form
    method="post"
    action="?/createTeam"
    class="md:col-span-2"
    novalidate
    use:enhance={() => {
      return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
    }}
  >
    <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
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
        label="OpenAI API Key"
        id="openAiApiKey"
        name="openAiApiKey"
        type="text"
        class="dark col-span-full"
        placeholder=""
      />
    </div>

    <div class="mt-8 flex">
      <button
        type="submit"
        class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >Create</button
      >
      <Alert
        class="ml-4"
        type={(form?.error && 'error') || (form?.success && 'success')}
        message={form?.error || form?.success}
      />
    </div>
  </form>
</div>
