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
  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Open AI API Key</h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">The key shared with the team</p>
    </div>

    {#if form?.error}
      <Alert message={form?.error} />
    {/if}

    <form method="post" class="md:col-span-2" use:enhance>
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div class="col-span-full">
          <!--          <label for="name" class="block text-sm font-medium leading-6 text-white">Name</label>-->
          <!--          <div class="mt-2">-->
          <!--            <input-->
          <!--              id="name"-->
          <!--              name="name"-->
          <!--              type="text"-->
          <!--              autocomplete="name"-->
          <!--              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"-->
          <!--            />-->
          <!--          </div>-->
          <Input
            name="openAiApiKey"
            value={form?.fields?.openAiApiKey ?? data.userTeam.team.openAiApiKey}
            errors={form?.errors?.openAiApiKey}
          />
        </div>

        <div class="col-span-full">
          <!--          <label for="email" class="block text-sm font-medium leading-6 text-white"-->
          <!--            >Email address</label-->
          <!--          >-->
          <!--          <div class="mt-2">-->
          <!--            <input-->
          <!--              id="email"-->
          <!--              name="email"-->
          <!--              type="email"-->
          <!--              autocomplete="email"-->
          <!--              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"-->
          <!--            />-->
          <!--          </div>-->
          <Input
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
