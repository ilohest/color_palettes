<template>
  <div>
    <!-- Barre d'outils -->
    <div class="toolbar">
      <!-- Bouton Ajouter Palette avec icône + -->
      <Button
        v-if="user"
        label="Ajouter une Palette"
        icon="pi pi-plus"
        class="p-button-outlined add-btn"
        @click="openCreateForm"
      />

      <!-- Toggle switch pour filtrer les palettes -->
      <div v-if="user" class="toggle-group">
        <span class="toggle-label left">
          <i class="pi pi-users"></i>
        </span>
        <InputSwitch v-model="showUserPalettes" />
        <span class="toggle-label right">
          <i class="pi pi-user"></i>
        </span>
      </div>

      <!-- Toggle switch pour trier les palettes -->
      <div class="toggle-group" v-if="palettes.length > 1">
        <span class="toggle-label left">
          <i class="pi pi-calendar"></i>
          <i class="pi pi-sort-amount-up"></i>
        </span>
        <InputSwitch v-model="randomOrder" />
        <span class="toggle-label right">
          <i class="fas fa-shuffle"></i>
        </span>
      </div>
    </div>

    <div v-if="!displayedPalettes || displayedPalettes.length === 0">
      Aucune palette enregistrée.
    </div>

    <!-- Grille des palettes -->
    <div class="palette-grid">
      <!-- Chaque palette s'affiche comme une carte -->
      <div
        v-for="palette in displayedPalettes"
        :key="palette.id"
        class="palette-card"
        @click="handlePaletteClick(palette, $event)"
      >
        <!-- Boutons d'action (Modifier / Supprimer) superposés -->
        <div class="palette-actions" @click.stop>
          <Button
            v-if="user && user.uid === palette.createdBy"
            icon="pi pi-pencil"
            class="p-button-text"
            @click="editPalette(palette)"
          />
          <Button
            v-if="user && user.uid === palette.createdBy"
            icon="pi pi-trash"
            class="p-button-text p-button-danger"
            @click="deletePalette(palette)"
          />
        </div>

        <!-- Affichage des couleurs dans la palette -->
        <div
          class="color-box"
          v-for="(color, index) in palette.colors"
          :key="index"
          :style="{ backgroundColor: color, width: `${100 / palette.colors.length}%` }"
        >
          <!-- <span :style="{ color: getTextColor(color) }">{{ color }}</span> -->
        </div>
      </div>
    </div>

    <!-- Overlay pour afficher la palette en plein écran -->
    <div v-if="selectedPalette" class="overlay" @click="closeOverlay">
      <div class="full-palette" @click.stop>
        <Button icon="pi pi-times" class="close-btn" @click="closeOverlay" />
        <div class="palette-card">
          <div
            class="full-color-box"
            v-for="(color, index) in selectedPalette.colors"
            :key="index"
            :style="{ backgroundColor: color }"
          >
            <span :style="{ color: getTextColor(color) }">{{ color }}</span>
            <span :style="{ color: getTextColor(color) }">{{ getRGBFromHex(color) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PaletteForm pour création / modification -->
    <PaletteForm
      v-if="showPaletteForm"
      :palette="editingPalette"
      @save="handleSavePalette"
      @close="showPaletteForm = false"
    />
  </div>
</template>

<script>
import { computed, ref, onMounted } from "vue";
import { usePaletteStore } from "@/stores/usePaletteStore.js";
import { useAuthStore } from "@/stores/useAuthStore.js";
import PaletteForm from "@/components/PaletteForm.vue";
import Button from "primevue/button";
import InputSwitch from "primevue/inputswitch";

export default {
  components: { PaletteForm, Button, InputSwitch },
  setup() {
    const paletteStore = usePaletteStore();
    const authStore = useAuthStore();

    const showUserPalettes = ref(false);
    const randomOrder = ref(false);
    const showPaletteForm = ref(false);
    const editingPalette = ref(null);
    const selectedPalette = ref(null);

    const user = computed(() => authStore.user);
    const palettes = computed(() => paletteStore.palettes || []);

    const displayedPalettes = computed(() => {
      let filtered = showUserPalettes.value && user.value
        ? palettes.value.filter(p => p.createdBy === user.value.uid)
        : palettes.value;

      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (randomOrder.value) {
        filtered = [...filtered].sort(() => Math.random() - 0.5);
      }
      return filtered;
    });

    const toggleUserPalettes = () => {
      showUserPalettes.value = !showUserPalettes.value;
    };

    const toggleRandomOrder = () => {
      randomOrder.value = !randomOrder.value;
    };

    const openCreateForm = () => {
      editingPalette.value = null;
      showPaletteForm.value = true;
    };

    const editPalette = (palette) => {
      editingPalette.value = { ...palette, colors: [...palette.colors] };
      showPaletteForm.value = true;
    };

    const handleSavePalette = async (palette) => {
      try {
        if (!palette.id) {
          await paletteStore.addPalette(palette.colors);
        } else {
          await paletteStore.updatePalette(palette);
        }
        showPaletteForm.value = false;
      } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
      }
    };

    const deletePalette = async (palette) => {
      if (confirm("Voulez-vous vraiment supprimer cette palette ?")) {
        await paletteStore.deletePalette(palette.id);
      }
    };

    const getTextColor = (hexColor) => {
      if (!hexColor) return "#000";
      const r = parseInt(hexColor.substring(1, 3), 16);
      const g = parseInt(hexColor.substring(3, 5), 16);
      const b = parseInt(hexColor.substring(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? "#000" : "#fff";
    };

    const getRGBFromHex = (hex) => {
      if (!hex) return "";
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return `rgb(${r}, ${g}, ${b})`;
    };

    const viewPalette = (palette) => {
      selectedPalette.value = palette;
    };

    const closeOverlay = () => {
      selectedPalette.value = null;
    };

    // Utiliser handlePaletteClick pour éviter d'ouvrir l'overlay en cliquant sur les boutons
    const handlePaletteClick = (palette, event) => {
      if (!event.target.closest(".palette-actions")) {
        viewPalette(palette);
      }
    };

    onMounted(() => {
      paletteStore.fetchPalettes();
    });

    return {
      user,
      palettes,
      displayedPalettes,
      showUserPalettes,
      randomOrder,
      showPaletteForm,
      editingPalette,
      selectedPalette,
      toggleUserPalettes,
      toggleRandomOrder,
      openCreateForm,
      editPalette,
      handleSavePalette,
      deletePalette,
      getTextColor,
      getRGBFromHex,
      viewPalette,
      closeOverlay,
      handlePaletteClick,
    };
  },
};
</script>

<style scoped>
  .toolbar {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
    padding: 1rem;
    justify-content: flex-end;
  }
  .toggle-group {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .toggle-label {
    display: flex;
    align-items: center;
    font-size: 1rem;
  }
  .palette-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
  .palette-card {
    display: flex;
    flex-direction: row;
    border: 1px solid #ddd;
    border-radius: 20px;
    overflow: hidden;
    width: 100%;
    height: 100%;
    min-width: 350px;
    position: relative;
    cursor: pointer;
  }
  .color-box {
    flex: 1;
    padding-bottom: 5px;
    text-align: end;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 100px;
  }
  .color-box:last-child {
    border-right: none;
  }
  .color-box span {
    text-transform: uppercase;
  }
  .palette-actions {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    gap: 5px;
  }
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .full-palette {
    background: white;
    padding: 20px;
    border-radius: 30px;
    width: 80vw;
    height: 80vh;
    position: absolute;
  }
  .full-color-box {
    flex: 1;
    min-width: 100px;
    padding: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: end;
  }
  .close-btn {
    background: #d9534f;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
  }
  .close-btn:hover {
    background: #c9302c;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
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
  .close-btn {
    position: absolute;
    top: -1%;
    right: -1%;
    border-radius: 50%;
    background-color: #d9534f; /* Couleur de fond (rouge) */
    color: white; /* Couleur de l'icône */
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    z-index: 10;
  }
  .close-btn:hover {
    background-color: #c9302c;
  }
</style>
