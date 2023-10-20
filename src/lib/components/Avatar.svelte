<script lang="ts">
  import Gravatar from '$lib/components/Gravatar.svelte'
  import { socketUsersStore } from '$lib/stores/socket'
  import { getSocketUserForUser } from '$lib/utils/socket'
  import type { User } from '@prisma/client'
  import { scale } from 'svelte/transition'

  export let user: User
  export let dotConnectedClass: string | undefined
  export let dotDisconnectedClass: string | undefined
  export let transition = true

  const socketUser = getSocketUserForUser(user, $socketUsersStore)
</script>

<div class="relative self-start" in:scale={{ duration: transition ? 400 : 0 }}>
  <Gravatar
    title={user.name || user.email}
    class="{$$restProps?.class} overflow-hidden"
    value={user.email}
  />
  <span
    title={socketUser?.connected ? 'Connected' : 'Disconnected'}
    class="absolute block rounded-full {socketUser?.connected
      ? dotConnectedClass
      : dotDisconnectedClass}"
  />
</div>
