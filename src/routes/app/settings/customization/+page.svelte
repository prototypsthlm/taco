<script lang="ts">
  import Input from '$lib/components/Input.svelte'
  import InputGroup from '$lib/components/InputGroup.svelte'
  import LlmPersonalityList from '$lib/components/LlmPersonalityList.svelte'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData
</script>

<div class="divide-y divide-white/5">
  <form method="post" action="?/addPersonality">
    <InputGroup
      header="LLM Personality"
      description="Personalities provide a context to the LLM from the start of the conversation."
      {form}
      buttonText="Add Personality"
    >
      <Input
        class="dark col-span-full"
        label="Name"
        name="name"
        value={form?.fields?.name}
        errors={form?.errors?.name}
      />

      <Input
        class="dark col-span-full"
        label="Context"
        name="context"
        value={form?.fields?.context}
        errors={form?.errors?.context}
      />
    </InputGroup>
  </form>
  {#if data?.personalities?.length}
    <div class="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <h1 class="text-xl font-bold mb-8 text-accent">Your custom personalities</h1>
      <LlmPersonalityList personalities={data?.personalities} />
    </div>
  {:else}
    <div class="px-4 sm:px-6 lg:px-8 py-16">
      <p class="text-accent font-bold text-lg">No custom personalities yet...</p>
    </div>
  {/if}
</div>
