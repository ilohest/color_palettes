import { defineStore } from "pinia";
import { ref } from "vue"; 
import FirebaseService from "@/services/FirebaseService.js";

export const usePaletteStore = defineStore("paletteStore", {
  state: () => ({
    palettes: ref([]),
  }),

  actions: {
    // ✅ Méthode pour récupérer une palette par son ID
    getPaletteById(paletteId) {
        return this.palettes.find(p => p.id === paletteId);
    },

    async fetchPalettes() {
        //console.log("🔄 usePaletteStore.js : Chargement des palettes...");
        try {
          FirebaseService.fetchPalettes((fetchedPalettes) => {
            //console.log("📥 usePaletteStore.js : Palettes récupérées :", fetchedPalettes);
            this.palettes = fetchedPalettes; // ✅ Stocke les palettes
          });
        } catch (error) {
          console.error("❌ usePaletteStore.js : Erreur lors du chargement des palettes :", error);
        }
    },

    async addPalette(colors) {
      try {
        console.log("🖌️ usePaletteStore.js : Ajout de la palette :", colors);
        await FirebaseService.addPalette(colors);
        console.log("✅ usePaletteStore.js : Enregistrement Firebase réussi !");
        await this.fetchPalettes(); // Rafraîchir après ajout
      } catch (error) {
        console.error("❌ usePaletteStore.js : Erreur d'ajout de la palette :", error);
      }
    },

    async deletePalette(paletteId) {
        try {
          console.log("🗑️ usePaletteStore.js : Suppression de la palette :", paletteId);
          await FirebaseService.deletePalette({ id: paletteId, createdBy: this.getPaletteById(paletteId)?.createdBy });
          this.palettes = this.palettes.filter(p => p.id !== paletteId);
        } catch (error) {
          console.error("❌ usePaletteStore.js : Erreur de suppression :", error);
        }
    },

    async updatePalette(palette) {
        await FirebaseService.updatePalette(palette);
        const index = this.palettes.findIndex(p => p.id === palette.id);
        if (index !== -1) {
          this.palettes[index] = palette;
        }
    }      
  },
});
