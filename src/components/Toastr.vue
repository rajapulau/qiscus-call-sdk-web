<template>
  <div class="toastr" :class="toastrClass">
    {{ message }}
  </div>
</template>
<script>
  export default {
    name: 'Toastr',
    props: ['message', 'style'],
    computed: {
      toastrClass() {
        return 'toastr-' + this.style
      }
    }
  }
</script>