<script lang="ts">
  export let data
</script>

<!-- Settings forms -->
<div class="divide-y divide-white/5">
  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">
        Personal Information {data.user.name}
      </h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">
        Use a permanent address where you can receive mail.
      </p>
    </div>

    <form class="md:col-span-2">
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div class="col-span-full">
          <label for="name" class="block text-sm font-medium leading-6 text-white">Name</label>
          <div class="mt-2">
            <input
              id="name"
              name="name"
              type="text"
              autocomplete="name"
              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div class="col-span-full">
          <label for="email" class="block text-sm font-medium leading-6 text-white"
            >Email address</label
          >
          <div class="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
            />
          </div>
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

  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Change password</h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">
        Update your password associated with your account.
      </p>
    </div>

    <form class="md:col-span-2">
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div class="col-span-full">
          <label for="current-password" class="block text-sm font-medium leading-6 text-white"
            >Current password</label
          >
          <div class="mt-2">
            <input
              id="current-password"
              name="current_password"
              type="password"
              autocomplete="current-password"
              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div class="col-span-full">
          <label for="new-password" class="block text-sm font-medium leading-6 text-white"
            >New password</label
          >
          <div class="mt-2">
            <input
              id="new-password"
              name="new_password"
              type="password"
              autocomplete="new-password"
              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div class="col-span-full">
          <label for="confirm-password" class="block text-sm font-medium leading-6 text-white"
            >Confirm password</label
          >
          <div class="mt-2">
            <input
              id="confirm-password"
              name="confirm_password"
              type="password"
              autocomplete="new-password"
              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
            />
          </div>
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

  <div
    class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8"
  >
    <div>
      <h2 class="text-base font-semibold leading-7 text-white">Log out other sessions</h2>
      <p class="mt-1 text-sm leading-6 text-gray-400">
        Please enter your password to confirm you would like to log out of your other sessions
        across all of your devices.
      </p>
    </div>

    <form class="md:col-span-2">
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div class="col-span-full">
          <label for="logout-password" class="block text-sm font-medium leading-6 text-white"
            >Your password</label
          >
          <div class="mt-2">
            <input
              id="logout-password"
              name="password"
              type="password"
              autocomplete="current-password"
              class="block w-full border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 flex">
        <button
          type="submit"
          class="bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >Log out other sessions</button
        >
      </div>
    </form>
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

    <form class="flex items-start md:col-span-2">
      <button
        type="submit"
        class="bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
        >Yes, delete my account</button
      >
    </form>
  </div>
</div>
