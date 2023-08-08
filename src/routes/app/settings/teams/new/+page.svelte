<script lang="ts">
  import Input from '$lib/components/Input.svelte'

  export let form: ActionData
</script>

<div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
      Create a new team
    </h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" method="post" novalidate action="?/newTeam">
      <Input
        value={form?.fields?.name}
        errors={form?.errors?.name}
        label="Name*"
        id="name"
        name="name"
        type="text"
        class="dark"
        placeholder=""
      />

      <Input
        value={form?.fields?.openAiApiKey}
        errors={form?.errors?.openAiApiKey}
        label="OpenAI API Key"
        id="openAiApiKey"
        name="openAiApiKey"
        type="text"
        class="dark"
        placeholder=""
      />

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >Create Team</button
        >
      </div>
    </form>
  </div>
</div>
