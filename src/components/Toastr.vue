<template>
  <div class="toastr" :class="toastrClass">
  </div>
</template>
<script>
  export default {
    name: 'Toastr',
    props: ['style'],
    computed: {
      toastrClass() {
        return 'toastr-' + this.style
      }
    }
  }
</script>