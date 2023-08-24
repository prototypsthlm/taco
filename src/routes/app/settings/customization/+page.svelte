<script lang="ts">
  import { enhance } from '$app/forms'
  import Input from '$lib/components/Input.svelte'
  import InputGroup from '$lib/components/InputGroup.svelte'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData
</script>

<div class="divide-y divide-white/5">
  <form
    method="post"
    action="?/personal"
    use:enhance={() => {
      return ({ update }) => update({ reset: false })
    }}
  >
    <InputGroup
      header="LLM Personality"
      description="Personalities provide a context to the LLM from the start of the conversation."
      form={form?.personality}
      buttonText="Add Personality"
    >
      <Input
        class="dark col-span-full"
        label="Name"
        name="name"
        value={form?.personality?.fields?.name}
        errors={form?.personality?.errors?.name}
      />

      <Input
        class="dark col-span-full"
        label="Context"
        name="context"
        value={form?.personality?.fields?.context}
        errors={form?.personality?.errors?.context}
      />
    </InputGroup>
  </form>
  {#if data?.personalities?.length}
    <div>
      {#each data?.personalities as personality}
        <div>
          {personality.name}
        </div>
      {/each}
    </div>
    {:else}
    <div class="px-4 sm:px-6 lg:px-8 py-16">
      <p class="text-accent font-bold text-lg">
        No custom personalities yet...
      </p>
    </div>
  {/if}
</div>
