<!-- Composant pour afficher une palette de couleur -->

<template>
  <div class="palette-card">
    <div
      class="color-box"
      v-for="(color, index) in palette.colors"
      :key="index"
      :style="{ backgroundColor: color }"
    >
      <span :style="{ color: getTextColor(color) }">{{ color }}</span>
    </div>

    <button v-if="authStore.user && authStore.user.uid === palette.createdBy" @click="deletePalette">
      🗑️ Supprimer
    </button>
  </div>
</template>
  
<script>
  import { usePaletteStore } from "@/stores/usePaletteStore.js";
  import { useAuthStore } from "@/stores/useAuthStore.js";

  export default {
    props: ["palette"],
    setup(props) {
      const paletteStore = usePaletteStore();
      const authStore = useAuthStore();

      const deletePalette = () => {
        paletteStore.deletePalette(props.palette.id);
      };

      return { deletePalette, authStore };
    },
  };
</script>
  
<style scoped>
  .palette-card {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 8px;
    background: white;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 10px;
  }
  .colors {
    display: flex;
  }
  .color-box {
    flex: 1;
    text-align: center;
    padding: 10px;
  }
  .date {
    font-size: 0.8em;
    color: gray;
  }
</style>
  