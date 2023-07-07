<script lang="ts">
  import md5 from 'crypto-js/md5'

  export let userEmail: string
</script>

<img
  class={$$restProps.class || ''}
  src={`https://www.gravatar.com/avatar/${md5(userEmail)}?d=identicon`}
  alt=""
/>