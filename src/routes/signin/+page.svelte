<script lang="ts">
  import { enhance } from '$app/forms'
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import TacoIcon from '$lib/components/icons/TacoIcon.svelte'
  import { executeRecaptcha } from '$lib/utils/recaptcha.client'
  import type { ActionData } from './$types'
  import { PUBLIC_RECAPTCHA_SITE_KEY } from '$env/static/public'
  import Spinner from '$lib/components/Spinner.svelte'

  export let form: ActionData
  let formLoading = false
</script>

<svelte:head>
  <title>Sign in</title>
  <script
    src={`https://www.google.com/recaptcha/api.js?render=${PUBLIC_RECAPTCHA_SITE_KEY}`}
  ></script>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center gap-4">
    <div class="text-3xl md:text-5xl">
      <TacoIcon class="h-16 md:h-24" />
    </div>
    <h2
      class="mt-6 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100"
    >
      Sign in to your account
    </h2>
  </div>

  <div class="sm:mx-auto sm:w-full sm:max-w-[480px]">
    <div class="bg-white dark:bg-gray-900 px-6 py-12 shadow sm:px-12">
      <Alert
        type={(form?.error && 'error') || (form?.success && 'success')}
        title={form?.error || form?.success}
      />

      <form
        class="space-y-6 mt-4"
        method="POST"
        novalidate
        use:enhance={async ({ formData }) => {
          const recaptchaToken = await executeRecaptcha(window.grecaptcha)
          formLoading = true
          formData.append('recaptchaToken', recaptchaToken)
          return async ({ update }) => {
            formLoading = false
            return update({ reset: false })
          }
        }}
      >
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
          l78fv
          name="password"
          type="password"
          autocomplete="current-password"
        />

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-600 dark:bg-white/5"
            />
            <label
              for="remember"
              class="ml-3 block text-sm leading-6 text-gray-900 dark:text-gray-100"
              >Remember me</label
            >
          </div>

          <div class="text-sm leading-6">
            <a
              href="/forgot-password"
              class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >Forgot password?</a
            >
          </div>
        </div>

        <button
          data-testid="signin-button"
          type="submit"
          disabled={formLoading}
          class="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {#if formLoading}
            <Spinner />
          {/if}
          <span>Sign in</span>
        </button>
      </form>
    </div>

    <p class="mt-10 text-center text-sm text-gray-500">
      Not a member?
      <a href="/signup" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >Sign up</a
      >
    </p>
  </div>
</div>
