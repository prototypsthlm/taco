<script lang="ts">
  import { enhance } from '$app/forms'
  import logo from '$lib/assets/logo.png'
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import type { ActionData } from './$types'

  export let form: ActionData
</script>

<svelte:head>
  <title>Signup</title>
</svelte:head>

<div
  class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
>
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <img class="mx-auto h-16 w-auto" src={logo} alt="TACO" />
    <h2
      class="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100"
    >
      Create an account
    </h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
    <div class="bg-white dark:bg-gray-900 px-6 py-12 shadow sm:rounded-lg sm:px-12">
      <Alert
        type={(form?.error && 'error') || (form?.success && 'success')}
        message={form?.error || form?.success}
      />
      <form
        class="space-y-6"
        method="POST"
        novalidate
        use:enhance={() => {
          return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
        }}
      >
        <Input
          value={form?.fields?.name}
          errors={form?.errors?.name}
          label="Name"
          id="name"
          name="name"
          autocomplete="name"
        />
        <Input
          value={form?.fields?.email}
          errors={form?.errors?.email}
          label="Email"
          id="email"
          name="email"
          type="email"
          autocomplete="email"
        />
        <Input
          value={form?.fields?.password}
          errors={form?.errors?.password}
          label="Password"
          id="password"
          name="password"
          type="password"
          autocomplete="new-password"
        />
        <Input
          value={form?.fields?.confirmPassword}
          errors={form?.errors?.confirmPassword}
          label="Confirm Password"
          id="confirm-password"
          name="confirmPassword"
          type="password"
        />

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >Sign up
          </button>
        </div>
      </form>
    </div>

    <p class="mt-10 text-center text-sm text-gray-500">
      Already a member?
      <a href="/signin" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >Sign in</a
      >
    </p>
  </div>
</div>
