// Code pour le formulaire de création / modification de palette
// émet des événements "save" et "close" pour enregistrer ou fermer le formulaire
//--------------------------------------------------------------------------------

<template>
  <div class="p-dialog-mask" @click.self="closeForm">
    <div class="p-dialog">
      <div class="p-dialog-header">
        <Button icon="pi pi-times" class="p-dialog-header-icon" @click="closeForm" />
      </div>
      <div class="p-dialog-content">
        <!-- Input URL pour importer une palette -->
        <div class="p-field">
          <InputText
            v-model="paletteUrl"
            placeholder="Collez l'URL de la palette Coolors.co"
            @input="parseUrl"
            class="url-input"
          />
        </div>

        <!-- Aperçu des couleurs extraites / saisies -->
        <div v-if="localColors.length" class="color-preview-container">
          <div
            v-for="(color, index) in localColors"
            :key="index"
            class="color-preview"
            :style="{ backgroundColor: color, width: `${100 / localColors.length}%` }"
          >
          </div>
        </div>

        <!-- Champs pour saisir ou modifier les couleurs -->
        <div
          v-for="(color, index) in localColors"
          :key="index"
          class="p-field p-inputgroup"
        >
          <InputText
            v-model="localColors[index]"
            placeholder="Couleur HEX (#000000)"
          />
          <Button
            v-if="localColors.length > 1"
            icon="pi pi-times"
            class="p-button-danger"
            @click="removeColor(index)"
          />
        </div>

        <Button
          label="Ajouter une couleur"
          icon="pi pi-plus"
          class="p-button-outlined p-mb-3"
          @click="addColor"
        />
      </div>
      <div class="p-dialog-footer">
        <Button label="Enregistrer" icon="pi pi-check" @click="savePalette" />
        <Button
          label="Annuler"
          icon="pi pi-times"
          class="p-button-secondary"
          @click="closeForm"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";

export default {
  name: "PaletteForm",
  props: {
    palette: Object,
  },
  emits: ["save", "close"],
  setup(props, { emit }) {
    const isEditing = computed(() => !!props.palette);
    // En mode création, initialiser avec 4 champs vides
    const localColors = ref(props.palette ? [...props.palette.colors] : ["", "", "", ""]);
    const paletteUrl = ref("");
    
    // extractedColors n'est plus utilisé pour l'aperçu si on choisit Option 1
    const extractedColors = ref([]);

    const parseUrl = () => {
      const url = paletteUrl.value.trim();
      if (!url.includes("coolors.co/")) return;
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      const colors = lastPart.split("-");
      // Préfixer avec '#' si nécessaire
      extractedColors.value = colors.map(color => color.startsWith("#") ? color : "#" + color);
      // Mise à jour de localColors avec les couleurs extraites
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
      const newPalette = {
        id: null,
        colors: localColors.value.filter(c => c.trim() !== ""),
        createdBy: null,
        createdAt: new Date().toISOString(),
      };
      emit("save", newPalette);
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
.p-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.p-dialog {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.p-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.p-dialog-title {
  font-size: 1.5rem;
  font-family: 'Asset', sans-serif;
}

.p-dialog-header-icon {
  cursor: pointer;
}

.p-dialog-content {
  padding: 1rem;
}

.p-dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #ddd;
  gap: 10px;
}

.url-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Conteneur de l'aperçu des couleurs */
.color-preview-container {
  display: flex;
  gap: 0;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

/* Chaque couleur occupe une largeur égale */
.color-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  color: white;
  font-weight: bold;
}
.p-dialog-header {
  display: flex;
  justify-content: flex-end;
}
.p-dialog-content{
  gap: 10px!important;
  display: flex!important;
  flex-direction: column!important;
}
.p-inputgroup {
  width: auto!important;
  display: flex!important;
  justify-content: space-between!important;
  gap: 10px!important;
}
.p-inputtext {
  width: 100%!important;
}
</style>
