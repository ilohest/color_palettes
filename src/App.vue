<template>
  <div>
    <Navbar />
    <router-view />
  </div>
</template>

<script>
  import Navbar from './components/Navbar.vue';

  export default {
    components: {
      Navbar
    }
  };
</script>

<style>
  body {
    font-family: 'Arya', sans-serif;
  }

  /* Pour les titres */
  h1, h2, h3, h4, h5, h6, .title {
    font-family: 'Asset', sans-serif;
    /* font-family: 'Coiny', sans-serif; */
  }
</style>
