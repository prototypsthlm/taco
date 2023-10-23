<script lang="ts">
  import { enhance } from '$app/forms'
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import TacoIcon from '$lib/components/icons/TacoIcon.svelte'
  import type { ActionData, PageData } from './$types'

  export let form: ActionData
  export let data: PageData
</script>

<svelte:head>
  <title>Reset Password</title>
</svelte:head>

<div
  class="min-h-screen bg-gray-50 dark:bg-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
>
  <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center gap-4">
    <div class="text-3xl md:text-5xl">
      <TacoIcon class="h-16 md:h-24 w-auto" dark />
    </div>
    <h2
      class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100"
    >
      Reset your password
    </h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
    {#if data.isTokenValid}
      <div class="bg-white dark:bg-gray-900 px-6 py-12 shadow sm:px-12">
        {#if form?.error}
          <Alert type="error" title={form?.error} />
        {/if}

        <form
          class="space-y-6 mt-4"
          method="POST"
          novalidate
          use:enhance={() => {
            return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
          }}
        >
          <Input
            errors={form?.errors?.password}
            label="Password"
            id="password"
            name="password"
            type="password"
            autocomplete="password"
          />
          <Input
            errors={form?.errors?.confirmPassword}
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="password"
          />

          <div class="flex items-center justify-between">
            <div>
              <button
                type="submit"
                class="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-400 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >Reset password
              </button>
            </div>
          </div>
        </form>
      </div>
    {:else}
      <Alert type="error" title="The reset password link is invalid or has expired." />
    {/if}

    <p class="mt-10 text-center text-sm text-gray-500">
      Looking for
      <a
        href="/signin"
        class="font-semibold leading-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
        >Sign in
      </a>
      ?
    </p>
  </div>
</div>
