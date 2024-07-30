<template>
  <div id="app">
    <UploadFile />
  </div>
</template>

<script>
import UploadFile from './components/UploadFile.vue'

export default {
  name: 'App',
  components: {
    UploadFile
  },
  created () {

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
