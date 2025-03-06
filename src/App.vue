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
    margin: 0;
  }
  /* Pour les titres */
  h1, h2, h3, h4, h5, h6, .title {
    /* font-family: 'Asset', sans-serif; */
    font-family: 'Coiny', sans-serif;
  }
  h1 {
    font-size: 2.5rem;
  }
  body > .p-colorpicker-panel {
    z-index: 2000 !important;
  }
  .p-colorpicker > .p-colorpicker-preview {
    border: 1px solid var(--preview-border-color) !important;
  }
  :root {
    --p-button-primary-background: #94A3B8!important;
    --p-button-primary-border-col: #94A3B8!important;
    --p-button-outlined-primary-border-color: #94A3B8!important;
    --p-button-outlined-primary-color: #94A3B8!important;
    --p-button-outlined-primary-hover-background: #cbd5e144!important;
    --p-button-primary-hover-background: rgba(203, 213, 225, 0.514)!important;
    --p-button-primary-border-color: #94A3B8!important;
    --p-button-primary-hover-border-color: #94A3B8!important;
    --p-button-outlined-primary-active-background: rgba(203, 213, 225, 0.514)!important;
    --p-button-border-radius: 50px!important;
  }
</style>
