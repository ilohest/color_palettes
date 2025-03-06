<template>
  <div class="overlay" @click.self="closeForm">
    <div class="popup">
      <h2>{{ isEditing ? "Modifier la palette" : "Créer une palette" }}</h2>

      <!-- Input URL pour importer une palette -->
      <input
        v-model="paletteUrl"
        placeholder="Collez l'URL de la palette (ex: https://coolors.co/36213e-554971-63768d-8ac6d0-b8f3ff)"
        @input="parseUrl"
        class="url-input"
      />

      <!-- Aperçu des couleurs extraites -->
      <div v-if="extractedColors.length" class="extracted-colors">
        <p>Couleurs extraites :</p>
        <div class="color-preview"
             v-for="(color, index) in extractedColors"
             :key="index"
             :style="{ backgroundColor: color }">
          {{ color }}
        </div>
      </div>

      <!-- Champs de saisie pour les couleurs (précédemment extraites ou saisis manuellement) -->
      <div v-for="(color, index) in localColors" :key="index" class="color-input">
        <input
          v-model="localColors[index]"
          placeholder="Couleur HEX (#000000)"
          class="full-color-input"
        />
        <button class="delete-btn" @click="removeColor(index)" v-if="localColors.length > 1">❌</button>
      </div>

      <button class="add-color-btn" @click="addColor">➕ Ajouter une couleur manuellement</button>

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
      palette: Object, // Si présent, on est en mode édition
    },
    emits: ["save", "close"],
    setup(props, { emit }) {
      const isEditing = computed(() => !!props.palette);
      // Initialisation : en mode création, on démarre avec 4 entrées vides
      const localColors = ref(props.palette ? [...props.palette.colors] : ["", "", "", ""]);
      const paletteUrl = ref("");
      const extractedColors = ref([]);

      // Fonction pour parser l'URL de type coolors.co
      const parseUrl = () => {
        const url = paletteUrl.value.trim();
        if (!url.includes("coolors.co/")) return;
        // On prend la dernière partie de l'URL après le dernier '/'
        const parts = url.split("/");
        const lastPart = parts[parts.length - 1];
        // Les codes sont séparés par des tirets
        const colors = lastPart.split("-");
        // Préfixer avec '#' si nécessaire et mettre à jour extractedColors
        extractedColors.value = colors.map(color => color.startsWith("#") ? color : "#" + color);
        // Mettre à jour les couleurs locales avec celles extraites
        localColors.value = [...extractedColors.value];
      };

      const addColor = () => {
        localColors.value.push("");
      };

      const removeColor = (index) => {
        if (localColors.value.length > 1) {
          localColors.value.splice(index, 1);
        }
      };

      const savePalette = () => {
        const updatedPalette = {
          id: props.palette ? props.palette.id : null,
          colors: localColors.value.filter(c => c.trim() !== ""),
          createdBy: props.palette ? props.palette.createdBy : null,
          createdAt: props.palette ? props.palette.createdAt : new Date().toISOString(),
        };
        emit("save", updatedPalette);
      };

      const closeForm = () => {
        emit("close");
      };

      return {
        isEditing,
        localColors,
        paletteUrl,
        extractedColors,
        parseUrl,
        addColor,
        removeColor,
        savePalette,
        closeForm,
      };
    },
  };
</script>

<style scoped>
  .url-input {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .extracted-colors {
    margin-bottom: 10px;
  }

  .color-preview {
    display: inline-block;
    width: 50px;
    height: 50px;
    margin: 2px;
    border: 1px solid #ddd;
  }

  .color-input {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .full-color-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .add-color-btn {
    margin: 10px 0;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
</style>
