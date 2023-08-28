<script lang="ts">
  import { enhance } from '$app/forms'
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import InputGroup from '$lib/components/InputGroup.svelte'
  import LlmPersonalityList from '$lib/components/LlmPersonalityList.svelte'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData
</script>

<div class="divide-y divide-white/5">
  <form method="post" action="?/addPersonality" use:enhance>
    <InputGroup
      header="LLM Personality"
      description="Personalities provide a context to the LLM from the start of the conversation."
      form={form?.personalityCreation}
      buttonText="Add Personality"
    >
      <Input
        class="dark col-span-full"
        label="Name"
        name="name"
        value={form?.personalityCreation?.fields?.name || null}
        errors={form?.personalityCreation?.errors?.name}
      />

      <Input
        class="dark col-span-full"
        label="Context"
        name="context"
        value={form?.personalityCreation?.fields?.context || null}
        errors={form?.personalityCreation?.errors?.context}
      />
    </InputGroup>
  </form>
  {#if data?.personalities?.length}
    <div class="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <h1 class="text-xl font-bold mb-8 text-accent">Your custom personalities</h1>
      <Alert
        type={(form?.personalityList?.error && 'error') ||
          (form?.personalityList?.success && 'success')}
        message={form?.personalityList?.error || form?.personalityList?.success}
      />
      <LlmPersonalityList personalities={data?.personalities} />
    </div>
  {:else}
    <div class="px-4 sm:px-6 lg:px-8 py-16">
      <p class="text-accent font-bold text-lg">No custom personalities yet...</p>
    </div>
  {/if}
</div>
