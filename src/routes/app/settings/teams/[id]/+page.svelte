<script lang="ts">
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { PageData, ActionData } from './$types'
  import { enhance } from '$app/forms'

  export let data: PageData
  export let form: ActionData
</script>

<header
  class="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
>
  <h1 class="text-base font-semibold leading-7 text-white">Team {data.userTeam.team.name}</h1>
</header>
<div class="divide-y divide-white/5">
  <Alert
    class="mx-4"
    type={(form?.error && 'error') || (form?.success && 'success')}
    message={form?.error || form?.success}
  />
  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Open AI API Key</h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">The key shared with the team</p>
    </div>

    <form
      method="post"
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
            value={form?.fields?.openAiApiKey ?? data.userTeam.team.openAiApiKey}
            errors={form?.errors?.openAiApiKey}
          />
        </div>

        <div class="col-span-full">
          <Input
            class="dark"
            name="name"
            value={form?.fields?.name ?? data.userTeam.team.name}
            errors={form?.errors?.name}
          />
        </div>
      </div>

      <div class="mt-8 flex">
        <button
          type="submit"
          class="bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >Save</button
        >
      </div>
    </form>
  </div>
</div>
