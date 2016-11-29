<template>
  <div class="qrw-config">
    <div class="qrw-header">
      <h3>Configuration</h3>
      <i class="fa fa-chevron-down minimize-btn" @click="minimizeHandler"></i>
    </div>
    <label>email</label>
    <input type="email" v-model="email">
    <label>username</label>
    <input type="text" v-model="username">
    <button @click="submitConfig">start calling</button>
  </div>
</template>
<script>
  export default {
    name: 'RtcConfig',
    props: ['submitHandler', 'minimizeHandler'],
    data() {
      return {
        email: '',
        username: ''
      }
    },
    methods: {
      submitConfig() {
        this.submitHandler({
          email: this.email, 
          username: this.username
        })
        this.email = ''
        this.username = ''
      }
    }
  }
</script>