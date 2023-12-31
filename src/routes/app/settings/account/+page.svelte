<script lang="ts">
  import { enhance } from '$app/forms'
  import Input from '$lib/components/Input.svelte'
  import InputGroup from '$lib/components/InputGroup.svelte'
  import ModalConfirm from '$lib/components/ModalConfirm.svelte'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData

  let deleteForm: HTMLFormElement
</script>

<!-- Settings forms -->
<div class="divide-y divide-white/5">
  <form
    method="post"
    action="?/personal"
    use:enhance={() => {
      //<!-- aixo es llença a .ts actions:Actions-->
      return ({ update }) => update({ reset: false }) // workaround for this known issue: @link: https://github.com/sveltejs/kit/issues/8513#issuecomment-1382500465
    }}
  >
    <InputGroup
      header="Personal Information"
      description="Use a permanent address where you can receive mail."
      form={form?.personal}
    >
      <Input
        class="dark col-span-full"
        label="Name"
        name="name"
        value={form?.personal?.fields?.name || data.user.name}
        errors={form?.personal?.errors?.name}
      />

      <Input
        class="dark col-span-full"
        label="Email"
        name="email"
        type="email"
        value={form?.personal?.fields?.email || data.user.email}
        errors={form?.personal?.errors?.email}
      />
    </InputGroup>
  </form>

  <form method="post" action="?/password">
    <InputGroup
      header="Change password"
      description="Update your password associated with your account."
      form={form?.password}
    >
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
    </InputGroup>
  </form>

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
      <ModalConfirm type="warning" on:confirm={() => deleteForm.requestSubmit()}>
        <button
          type="button"
          slot="trigger"
          class="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
          >Yes, delete my account
        </button>
        <svelte:fragment slot="title">Are you sure you want to delete your account?</svelte:fragment
        >
        <p slot="body" class="text-sm text-gray-500">
          All of your data will be permanently removed from our servers forever. This action cannot
          be undone.
        </p>
        <svelte:fragment slot="cancel">I changed my mind</svelte:fragment>
        <svelte:fragment slot="confirm">Yes, delete it all!</svelte:fragment>
      </ModalConfirm>
    </form>
  </div>
</div>
