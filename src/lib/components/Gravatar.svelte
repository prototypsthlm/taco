<script lang="ts">
  import md5 from 'crypto-js/md5'

  export let value = ''
</script>

<img
  class={$$restProps.class || ''}
  title={$$restProps.title || ''}
  src={`https://www.gravatar.com/avatar/${md5(value)}?d=identicon`}
  alt={$$restProps.alt || ''}
/>
