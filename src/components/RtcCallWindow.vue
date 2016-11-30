<template>
  <div class="rtc-call-window">
    <div class="rtc-callee-video">
      <loader width="100px" height="100px"></loader>
      <strong>{{ callee }}</strong>
    </div>
    <div class="rtc-caller-video">
      <strong>{{ caller }}</strong>
    </div>
    <ul class="rtc-call-ui">
      <li><i class="fa fa-fw fa-microphone"></i></li>
      <li><i class="fa fa-fw fa-volume-off"></i></li>
      <li><i class="fa fa-fw fa-video-camera"></i></li>
      <li @click="endCall">
        <i class="fa fa-fw fa-times"></i>
      </li>
    </div>
  </div>
</template>
<script>
  import Loader from './Loader.vue'
  export default {
    name: 'RtcCallWindow',
    components: {Loader},
    computed: {
      caller: function() { return this.$store.state.qiscus.userData.email },
      callee: function() { return this.$store.state.qiscus.UI.callee[0] }
    },
    methods: {
      endCall() {
        this.$store.dispatch('endCall');
      }
    }
  }
</script>