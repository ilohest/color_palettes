import { defineStore } from "pinia";
import { ref } from "vue";
import { auth } from "@/services/FirebaseConfig.js"; // Import Firebase Auth
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: null, // ✅ Stocke l'utilisateur connecté
  }),

  actions: {
    // 🔥 Écouteur de Firebase pour détecter l'état de connexion
    listenForAuthChanges() {
      onAuthStateChanged(auth, (user) => {
        this.user = user ? user : null;
        //console.log("🔥 useAuthStore.js : Changement d'utilisateur détecté :", this.user);
      });
    },

    // 🔥 Connexion avec Google
    async signInWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        this.user = result.user; // ✅ Mise à jour Pinia
      } catch (error) {
        console.error("useAuthStore.js : Erreur d'authentification :", error);
      }
    },

    // 🔥 Déconnexion
    async logout() {
      await signOut(auth);
      this.user = null; // ✅ Supprime l'utilisateur après déconnexion
    },
  },
});
