<template>
  <div class="overlay" @click.self="closeForm">
    <div class="popup">
      <h2>{{ isEditing ? "Modifier la palette" : "Créer une palette" }}</h2>

      <div v-for="(color, index) in localColors" :key="index" class="color-input">
        <input v-model="localColors[index]" placeholder="Couleur HEX (#000000)" />
        <button class="delete-btn" @click="removeColor(index)" v-if="localColors.length > 1">❌</button>
      </div>

      <button class="add-color-btn" @click="addColor">➕ Ajouter une couleur</button>

      <div class="actions">
        <button @click="savePalette">{{ isEditing ? "Mettre à jour" : "Enregistrer" }}</button>
        <button @click="closeForm">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  props: {
    // Si palette est fourni, on est en mode édition, sinon création.
    palette: {
      type: Object,
      default: null,
    },
  },
  emits: ["save", "close"],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.palette);
    // Pour la création, on initialise avec 4 inputs vides.
    const localColors = ref(props.palette ? [...props.palette.colors] : ["", "", "", ""]);

    const addColor = () => {
      localColors.value.push("");
    };

    const removeColor = (index) => {
      if (localColors.value.length > 1) {
        localColors.value.splice(index, 1);
      }
    };

    const savePalette = () => {
      // Construire l'objet palette à envoyer.
      const updatedPalette = {
        // Pour la modification, on conserve l'id; sinon null pour création.
        id: props.palette ? props.palette.id : null,
        colors: localColors.value.filter((c) => c.trim() !== ""),
        // En création, on attribuera createdBy via le parent (en fonction de l'utilisateur connecté).
        createdBy: props.palette ? props.palette.createdBy : null,
        createdAt: props.palette ? props.palette.createdAt : new Date().toISOString(),
      };
      console.log("✅ PaletteForm.vue : Enregistrement de la palette :", updatedPalette);
      emit("save", updatedPalette);
    };

    const closeForm = () => {
      emit("close");
    };

    return { localColors, isEditing, addColor, removeColor, savePalette, closeForm };
  },
};
</script>

<style scoped>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .popup {
    background: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 350px;
  }
  .color-input {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .delete-btn {
    background: none;
    border: none;
    color: red;
    cursor: pointer;
  }
  .add-color-btn {
    display: block;
    margin: 10px 0;
  }
  .actions {
    display: flex;
    gap: 10px;
  }
</style>
