<template>
  <div class="qrw-window" :class="{'qrw-window--open': expand}">
    <div v-if="isInitted">
      <div class="qrw-header">
        <h3>Qiscus Widget</h3>
        <i class="fa fa-chevron-down minimize-btn" @click="minimizeHandler"></i>
      </div>
      <div style="text-align: center">
        Please select someone to call
      </div>
    </div>
    <rtc-config v-if="!isInitted" 
      :submit-handler="initConfig"
      :minimize-handler="minimizeHandler"></rtc-config>
  </div>
</template>

<script>
  import RtcConfig from './RtcConfig.vue'
  export default {
    name: 'RtcWidget', 
    components: {RtcConfig},
    props: ['expand', 'isInitted', 'minimizeHandler'], 
    data() {
      return {
        email: '',
        username: ''
      }
    },
    methods: {
      initConfig(payload) {
        this.$store.dispatch('init', {
          email:payload.email, 
          username: payload.username
        });
      }
    }
  }
</script>