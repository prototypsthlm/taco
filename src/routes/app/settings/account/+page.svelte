<script lang="ts">
  import { enhance } from '$app/forms'
  import Alert from '$lib/components/Alert.svelte'
  import Input from '$lib/components/Input.svelte'
  import ModalCancelConfirm from '$lib/components/ModalCancelConfirm.svelte'
  import type { ActionData, PageData } from './$types'

  let isModalOpen = false

  export let data: PageData
  export let form: ActionData
  let deleteForm
</script>

<!-- Settings forms -->
<div class="divide-y divide-white/5">
  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Personal Information</h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">
        Use a permanent address where you can receive mail.
      </p>
    </div>

    <form
      method="post"
      action="?/personal"
      class="md:col-span-2"
      use:enhance={() => {
        return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
      }}
    >
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <Input
          class="dark col-span-full"
          label="Name"
          name="name"
          value={form?.personal?.fields?.name || data.user.name}
          errors={form?.errors?.name}
        />

        <Input
          class="dark col-span-full"
          label="Email"
          name="email"
          type="email"
          value={form?.personal?.fields?.email || data.user.email}
          errors={form?.errors?.name}
        />
      </div>

      <div class="mt-8 flex">
        <button
          type="submit"
          class="bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >Save</button
        >
        <Alert
          type={(form?.personal?.error && 'error') || (form?.personal?.success && 'success')}
          message={form?.personal?.error || form?.personal?.success}
        />
      </div>
    </form>
  </div>

  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Change password</h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">
        Update your password associated with your account.
      </p>
    </div>

    <form
      method="post"
      action="?/password"
      class="md:col-span-2"
      use:enhance={() => {
        return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
      }}
    >
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <Input
          class="dark col-span-full"
          label="Current password"
          id="current-password"
          name="currentPassword"
          type="password"
          autocomplete="current-password"
          errors={form?.password?.errors?.currentPassword}
        />

        <Input
          class="dark col-span-full"
          label="New password"
          id="new-password"
          name="newPassword"
          type="password"
          autocomplete="new-password"
          errors={form?.password?.errors?.newPassword}
        />

        <Input
          class="dark col-span-full"
          label="Confirm password"
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          errors={form?.password?.errors?.confirmPassword}
        />
      </div>

      <div class="mt-8 flex">
        <button
          type="submit"
          class="bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >Save
        </button>
        <Alert
          type={(form?.password?.error && 'error') || (form?.password?.success && 'success')}
          message={form?.password?.error || form?.password?.success}
        />
      </div>
    </form>
  </div>

  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Log out</h2>
    </div>

    <div class="md:col-span-2">
      <div class="flex">
        <a
          class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          href="/signout">Log out</a
        >
      </div>
    </div>
  </div>

  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Delete account</h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">
        No longer want to use our service? You can delete your account here. This action is not
        reversible. All information related to this account will be deleted permanently.
      </p>
    </div>

    <form
      method="post"
      action="?/delete"
      class="flex items-start md:col-span-2"
      bind:this={deleteForm}
    >
      <button
        class="bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
        on:click={(e) => {
          e.preventDefault()
          isModalOpen = true
        }}
        >Yes, delete my account
      </button>
      <ModalCancelConfirm bind:open={isModalOpen} on:confirm={() => deleteForm.requestSubmit()}>
        <svelte:fragment slot="title">Are you sure you want to delete your account?</svelte:fragment
        >
        <p slot="body" class="text-sm text-gray-500">
          All of your data will be permanently removed from our servers forever. This action cannot
          be undone.
        </p>
        <svelte:fragment slot="cancel-button">I changed my mind</svelte:fragment>
        <svelte:fragment slot="confirm-button">Yes, delete it all!</svelte:fragment>
      </ModalCancelConfirm>
    </form>
  </div>
</div>
