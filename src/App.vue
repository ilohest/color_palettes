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
  body > .p-colorpicker-panel {
    z-index: 2000 !important;
  }
  .p-colorpicker > .p-colorpicker-preview {
    border: 1px solid var(--preview-border-color) !important;
  }
</style>
