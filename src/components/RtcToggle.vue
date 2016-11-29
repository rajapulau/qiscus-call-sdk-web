<template>
  <div>
    <div class="qrw-trigger" v-if="!loading" @click="clickHandler">
      <i class="fa fa-video-camera fa-fw"></i>
    </div>
    <div class="qrw-trigger" v-if="loading">
      <loader></loader>
    </div>
  </div>
</template>

<script>
  import Loader from './Loader.vue'
  export default {
    name: 'QrwTrigger',
    props: ['loading', 'isInitted', 'clickHandler'],
    components: { Loader },
  }
</script>