<template>
  <span class="loader" :style="{ width: width, height: height}"></span>
</template>

<script>
  export default {
    props: ['width', 'height']
  }
</script>

<style>
  .loader {
    border-radius: 50%;
    width: 20px; height: 20px;
    border: 3px solid rgba(255,255,255,.3);
    border-top-color: rgba(255,255,255,.7);
    display: inline-block;
    animation: rotate .9s linear infinite;
    vertical-align: middle;
    margin-right: 10px;
  }
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>