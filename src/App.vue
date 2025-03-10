// Composant racine qui enveloppe l'ensemble de l'application.
// Il contient la structure globale : barre de navigation et composant de routage. Sert de conteneur pour les vues principales.
// Il est responsable de l'initialisation de l'écoute des changements d'authentification.
// Il définit les styles globaux de l'application.
// Il définit les variables CSS personnalisées pour les boutons PrimeVue.
// ------------------------------------------------------------------------------------------------

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
    margin: 0;
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
    --p-button-border-radius: 50px!important;
  }
</style>
