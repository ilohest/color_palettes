// Composants réutilisables d interface.
// Composant pour afficher une palette de couleur individuelle.
// Ce composant affiche une palette de couleurs et des boutons d'action pour modifier et supprimer la palette (uniquement si l'utilisateur est le créateur de la palette).
// Il émet des événements "edit", "remove" et "view" pour gérer les actions de l'utilisateur.
//-----------------------------------------------------------------

<template>
  <div class="palette-card" @click="handleClick">
    <!-- Boutons d'action : modifier et supprimer (affichés uniquement si l'utilisateur est le créateur) -->
    <div class="palette-actions" @click.stop>
      <Button
        v-if="user && user.uid === palette.createdBy"
        icon="pi pi-pencil"
        class="p-button-text"
        @click.stop="edit"
      />
      <Button
        v-if="user && user.uid === palette.createdBy"
        icon="pi pi-trash"
        class="p-button-text p-button-danger"
        @click.stop="remove"
      />
    </div>
    <!-- Affichage des couleurs -->
    <div
      class="color-box"
      v-for="(color, index) in palette.colors"
      :key="index"
      :style="{ backgroundColor: color, width: `${100 / palette.colors.length}%` }"
    ></div>
  </div>
</template>

<script>
  import Button from "primevue/button";

  export default {
    name: "PaletteCard",
    components: { Button },
    props: {
      palette: {
        type: Object,
        required: true
      },
      user: {
        type: Object,
        required: false
      }
    },
    emits: ["edit", "remove", "view"],
    methods: {
      edit() {
        this.$emit("edit", this.palette);
      },
      remove() {
        this.$emit("remove", this.palette);
      },
      handleClick() {
        // Emit une action de vue lorsqu'on clique en dehors des boutons
        this.$emit("view", this.palette);
      }
    },
    mounted() {
      console.log("User UID:", this.user ? this.user.uid : "No user");
      console.log("Palette createdBy:", this.palette.createdBy);
    }

  };
</script>

<style scoped>
  .palette-card {
    position: relative;
    display: flex;
    flex-direction: row;
    border: 1px solid #ddd;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
  }
  .palette-actions {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    gap: 5px;
    z-index: 2;
  }
  .color-box {
    flex: 1;
    height: 100px;
  }
  .p-button-text, 
  .p-button-danger {
    background: rgb(115 115 115 / 29%)!important;
    border-color: transparent!important;
    color: #ffffff!important;
  }
</style>
