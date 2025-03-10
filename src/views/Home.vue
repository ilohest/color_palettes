// Vues associés aux routes définies
// Gère l'affichage et la logique de la page d'accueil.
//-----------------------------------------------------------------
// Le routeur affiche des vues qui utilisent des composants pour afficher l interface utilisateur
// Les composants & les vues utilisent les stores pour accéder à l état global (exemple : obtenir la liste des palettes / utilisateur connecté).
// Ces stores, à leur tour, appellent les méthodes définies dans services pour interagir avec Firebase.
//-----------------------------------------------------------------

<template>
  <div>
    <!-- Barre d'outils -->
    <div class="toolbar">
      <!-- Ajouter palette -->
      <Button
        v-if="user"
        icon="pi pi-plus"
        class="p-button-outlined add-btn"
        @click="openCreateForm"
      />

      <div class="filters">
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
    </div>

    <!-- Spinner de chargement -->
    <div v-if="isLoading" class="loading-spinner">
      <ProgressSpinner />
    </div>

    <!-- Message s'il n'y a aucune palette (après chargement) -->
    <div v-else-if="!displayedPalettes || displayedPalettes.length === 0">
      Aucune palette enregistrée.
    </div>
    
    <!-- Grille des palettes -->
    <div v-else class="palette-grid">
      <!-- Chaque palette s'affiche comme une carte -->
      <PaletteCard
        v-for="palette in displayedPalettes"
        :key="palette.id"
        :palette="palette"
        :user="user"
        @edit="editPalette"
        @remove="deletePalette"
        @view="viewPalette"
      />
    </div>

    <!-- Overlay pour afficher la palette en plein écran -->
    <div v-if="selectedPalette" class="overlay" @click="closeOverlay">
      <div class="full-palette" @click.stop>
        <!-- Bouton de fermeture stylisé comme une croix dans un cercle -->
        <Button icon="pi pi-times" class="close-btn" @click="closeOverlay" />
          <!-- Si la palette est éditable, afficher la zone draggable -->
          <template v-if="isPaletteEditable">
            <draggable
              v-model="editableColors"
              :options="{ animation: 200 }" 
              :itemKey="(item, index) => index"
              @end="updateFullPalette"
              class="palette-card"
            >
              <template #item="{ element, index }">
                <div
                  class="full-color-box"
                  :style="{ backgroundColor: element  }"
                >
                  <!-- Si la palette est éditable, afficher un input, sinon afficher le texte -->
                  <template v-if="isPaletteEditable">
                    <!-- Input pour modifier la couleur -->
                    <ColorPicker 
                      v-model="editableColors[index]" 
                      format="hex" 
                      showButtons
                      appendTo="body"
                      @input="updateFullPalette" 
                      @change="updateFullPalette"
                      :style="{
                        '--preview-border-color': getTextColor(element)  // Définir la variable CSS
                      }"
                    />
                    <input
                      type="text"
                      v-model="editableColors[index]"
                      @input="onColorInput(index, $event.target.value)"
                      @blur="updateFullPalette"
                      class="full-color-input"
                      :style="{ color: getTextColor(element) }"
                    />
                    <!-- Icône de suppression visible au survol -->
                    <span class="remove-icon" @click.stop="removeColorAt(index)" :style="{ color: getTextColor(element) }">
                      <i class="pi pi-times"></i>
                    </span>
                  </template>
                  <!-- Sinon, afficher le texte de la couleur -->
                  <template v-else>
                    <span class="color-code" :style="{ color: getTextColor(element) }">{{ element }}</span>
                  </template>
                  <!-- Affichage de l'équivalent RGB -->
                  <span class="color-code" :style="{ color: getTextColor(element) }">{{ getRGBFromHex(editableColors[index]) }}</span>
                  <!-- Bouton d'insertion affiché entre les éléments, sauf le dernier -->
                  <span
                    v-if="isPaletteEditable && index < editableColors.length - 1"
                    class="insert-plus"
                    @click.stop="insertColor(index)"
                  >
                    <i class="pi pi-plus"></i>
                  </span>
                  <!-- Bouton d'insertion extrême gauche (uniquement pour le premier élément) -->
                  <span
                    v-if="isPaletteEditable && index === 0"
                    class="insert-plus extreme left"
                    @click.stop="insertColorAtExtreme('left')"
                  >
                    <i class="pi pi-plus"></i>
                  </span>
                  <!-- Bouton d'insertion extrême droite (uniquement pour le dernier élément) -->
                  <span
                    v-if="isPaletteEditable && index === editableColors.length - 1"
                    class="insert-plus extreme right"
                    @click.stop="insertColorAtExtreme('right')"
                  >
                    <i class="pi pi-plus"></i>
                  </span>
                </div>
              </template>
            </draggable>
          </template>
          <!-- Sinon, afficher simplement les couleurs en lecture seule -->
          <template v-else class="palette-card">
            <div class="palette-card">  
              <div
                v-for="(color, index) in selectedPalette.colors"
                :key="index"
                class="full-color-box"
                :style="{ backgroundColor: color }"
              >
                <span class="color-code" :style="{ color: getTextColor(color) }">{{ color }}</span>
                <span class="color-code" :style="{ color: getTextColor(color) }">{{ getRGBFromHex(color) }}</span>
              </div>
            </div>
          </template>
        
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
import { computed, ref, onMounted, watch } from "vue";
import { usePaletteStore } from "@/stores/usePaletteStore.js";
import { useAuthStore } from "@/stores/useAuthStore.js";
import PaletteForm from "@/components/PaletteForm.vue";
import Button from "primevue/button";
import InputSwitch from "primevue/inputswitch";
import ProgressSpinner from "primevue/progressspinner";
import draggable from "vuedraggable";
import ColorPicker from 'primevue/colorpicker';
import PaletteCard from "@/components/PaletteCard.vue";

export default {
  components: { PaletteForm, Button, InputSwitch, draggable, ColorPicker, PaletteCard, ProgressSpinner },
  setup() {
    const paletteStore = usePaletteStore();
    const authStore = useAuthStore();

    const showUserPalettes = ref(false);
    const randomOrder = ref(false);
    const showPaletteForm = ref(false);
    const editingPalette = ref(null);
    const selectedPalette = ref(null);
    const editableColors = ref([]);
    const closingOverlay = ref(false);
    const isLoading = ref(true);

    const user = computed(() => authStore.user);
    const palettes = computed(() => paletteStore.palettes || []);

    // Filtrer les palettes à afficher en fonction des options de l'utilisateur
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

    // Vérifie si la palette actuellement sélectionnée est éditable par l'utilisateur connecté
    const isPaletteEditable = computed(() => {
      return selectedPalette.value && user.value && user.value.uid === selectedPalette.value.createdBy;
    });

    // Gestion des couleurs dans l'input
    const onColorInput = (index, value) => {
      // Si la valeur n'est pas vide et ne commence pas par '#', on l'ajoute
      // Crée une nouvelle référence pour le tableau, ce qui force Vue à mettre à jour tous les composants qui l’utilisent (comme PaletteCard).
      const newValue = value && value[0] !== '#' ? '#' + value : value;
      // Créer un nouveau tableau en remplaçant uniquement l'élément à l'index donné
      editableColors.value = editableColors.value.map((color, idx) =>
        idx === index ? newValue : color
      );    
    };

    // Calcule la couleur moyenne entre deux couleurs hexadécimales
    const averageColor = (color1, color2) => {
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);
      const r = Math.round((r1 + r2) / 2);
      const g = Math.round((g1 + g2) / 2);
      const b = Math.round((b1 + b2) / 2);
      const toHex = (num) => num.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Insertion à une extrémité en utilisant du blanc pour la moyenne
    const insertColorAtExtreme = (direction) => {
      if (isPaletteEditable.value) {
        if (direction === 'left') {
          const firstColor = editableColors.value[0];
          const newColor = averageColor(firstColor, "#FFFFFF");
          editableColors.value.unshift(newColor);
        } else if (direction === 'right') {
          const lastColor = editableColors.value[editableColors.value.length - 1];
          const newColor = averageColor(lastColor, "#FFFFFF");
          editableColors.value.push(newColor);
        }
        updateFullPalette();
      }
    };

    // Méthode pour insérer une nouvelle couleur à la position index+1
    const insertColor = (index) => {
      if (isPaletteEditable.value) {
        const leftColor = editableColors.value[index];
        const rightColor = editableColors.value[index + 1];
        const newColor = averageColor(leftColor, rightColor);
        editableColors.value.splice(index + 1, 0, newColor);
        updateFullPalette();
      }
    };

    // Méthode pour supprimer une couleur à l'index donné
    const removeColorAt = (index) => {
      if (isPaletteEditable.value) {
        editableColors.value.splice(index, 1);
        updateFullPalette(); // Met à jour la palette dans Firebase
      }
    };

    // Définir les options du draggable de manière réactive
    const draggableOptions = computed(() => ({
      animation: 200,
      disabled: !isPaletteEditable.value
    }));

    // Bascule l'affichage des palettes de l'utilisateur
    const toggleUserPalettes = () => {
      showUserPalettes.value = !showUserPalettes.value;
    };

    // Bascule l'ordre aléatoire
    const toggleRandomOrder = () => {
      randomOrder.value = !randomOrder.value;
    };

    // Ouvre le formulaire de création
    const openCreateForm = () => {
      editingPalette.value = null;
      showPaletteForm.value = true;
    };

    // Ouvre le formulaire de modification avec les données de la palette
    const editPalette = (palette) => {
      editingPalette.value = { ...palette, colors: [...palette.colors] };
      showPaletteForm.value = true;
    };

    // Enregistre ou met à jour une palette dans Firebase
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

    // Lorsque selectedPalette change, on initialise editableColors avec les couleurs de la palette
    watch(selectedPalette, (newPalette) => {
      if (newPalette) {
        editableColors.value = [...newPalette.colors];
      }
    });

    // Fonction pour ouvrir l'overlay en cliquant sur une palette (en dehors des boutons d'action)
    const viewPalette = (palette) => {
      selectedPalette.value = palette;
    };

    // Fonction pour fermer l'overlay
    const closeOverlay = async () => {
      // On lance updateFullPalette, mais on s'assure que celle-ci ne met pas à jour selectedPalette
      closingOverlay.value = true;
      updateFullPalette();
      selectedPalette.value = null;
      // On réinitialise le flag après un court délai
      setTimeout(() => {
        closingOverlay.value = false;
      }, 100);
    };

    // Utiliser handlePaletteClick pour éviter d'ouvrir l'overlay en cliquant sur les boutons
    const handlePaletteClick = (palette, event) => {
      if (!event.target.closest(".palette-actions")) {
        viewPalette(palette);
      }
    };

    // Lorsque selectedPalette change, initialiser editableColors pour le drag & drop
    watch(selectedPalette, (newPalette) => {
      if (newPalette) {
        editableColors.value = [...newPalette.colors];
      }
    });

    // Mettre à jour la palette dans Firebase quand le drag & drop est terminé
    const updateFullPalette = async () => {
      if (selectedPalette.value) {
        const updatedPalette = { ...selectedPalette.value, colors: [...editableColors.value] };
        try {
          await paletteStore.updatePalette(updatedPalette);
          // Ne mettre à jour selectedPalette que si l'overlay est toujours ouvert
          if (!closingOverlay.value && selectedPalette.value) {
            selectedPalette.value = { ...updatedPalette }; // Forcer la mise à jour en assignant une nouvelle référence à selectedPalette
          }
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'ordre des couleurs :", error);
        }
      }
    };

    // Vérifier si les couleurs sont valides et ajouter le préfixe '#' si nécessaire
    watch(
      editableColors,
      (newColors) => {
        newColors.forEach((val, idx) => {
          if (val && val[0] !== '#') {
            editableColors.value[idx] = '#' + val;
          }
        });
      },
      { deep: true }
    );

    watch(palettes, (newPalettes) => {
      // Dès qu'il y a un changement dans palettes, on désactive le spinner
      isLoading.value = false;
    });

    // Récupérer les palettes lors du montage du composant
    onMounted(() => {
      // Utilise le callback de fetchPalettes pour désactiver le spinner une fois le chargement terminé
      paletteStore.fetchPalettes(() => {
        isLoading.value = false;
      });
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
      editableColors,
      updateFullPalette,
      isPaletteEditable,
      draggableOptions,
      removeColorAt,
      insertColor,
      averageColor,
      onColorInput,
      insertColorAtExtreme,
      isLoading,
    };
  },
};
</script>

<style scoped>
  .toolbar {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
    padding: 0.5rem 1rem;
    justify-content: flex-end;
    box-shadow: rgba(0, 0, 0, 0.075) 0 1px;
  }
  .filters {
    display: flex;
    gap: 20px;
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
    position: relative;
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
    background-color:  #94A3B8!important;
    color: white; 
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
    background-color: rgb(117, 117, 117)!important;
  }
  .full-color-input {
    background: transparent;
    border: none;
    text-align: center;
    text-transform: uppercase;
    padding: 15px;
  }
  .remove-icon {
    position: absolute;
    bottom: 20%;
    right: 50%;
    transform: translateX(50%);
    border-radius: 50%;
    padding: 2px 8px;
    cursor: pointer;
    display: none; 
  }
  .full-color-box:hover .remove-icon {
    display: block; /* Affiché lors du survol */
  }
  .color-code {
    text-transform: uppercase;
  }
  .insert-plus {
    position: absolute;
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.6);
    color: #000;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 100;
  }
  .full-color-box:hover .insert-plus {
    opacity: 1;
  }
  .p-colorpicker-preview {
    width: 100%;
  }
  .p-colorpicker-panel {
    z-index: 1000 !important;
  }
  .insert-plus {
    position: absolute;
    background: rgba(255, 255, 255, 0.6);
    color: #000;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 100;
  }
  .full-color-box .insert-plus.extreme {
    opacity: 0;
    transition: opacity 0.2s;
  }
  .full-color-box:hover .insert-plus.extreme {
    opacity: 1;
  }
  .insert-plus.extreme.left {
    left: -14px;
    top: 50%;
    transform: translateY(-50%);
  }
  .insert-plus.extreme.right {
    right: -14px;
    top: 50%;
    transform: translateY(-50%);
  }
  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  @media (max-width: 850px) {
    .full-palette > .palette-card {
      flex-direction: column;
    }
    .palette-card {
      min-width: unset;
    }
    .full-color-input {
      padding: 0;
    }
    .full-color-box {
      justify-content: center;
      padding: 0;
    }
    .toolbar {
      justify-content: space-between;
    } 
    .p-colorpicker {
      display: none;
    }
    .full-palette {
      width: 95vw;
      height: 95vh;
    }
  }
</style>
