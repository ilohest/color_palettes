// Gestion d’état centralisée avec Pinia.
// Stocke l'utilisateur connecté et gère les actions d'authentificationn (connexion, déconnexion).
//-----------------------------------------------------------------------------------------------

import { defineStore } from "pinia";
import { auth, db } from "@/services/FirebaseConfig.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { set, ref, get } from "firebase/database";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: null, // Stocke l'utilisateur connecté et ses infos supplémentaires
  }),

  actions: {
    // Écoute les changements d'état de connexion et fusionne les infos supplémentaires depuis la DB
    listenForAuthChanges() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Tente de récupérer les informations supplémentaires stockées dans /users/{uid}
            const snapshot = await get(ref(db, `users/${user.uid}`));
            const additionalData = snapshot.exists() ? snapshot.val() : {};
            // Fusionne les infos de Firebase Auth et celles de la DB
            this.user = { ...user, ...additionalData };
          } catch (error) {
            console.error("Erreur lors de la récupération des infos supplémentaires :", error);
            this.user = user;
          }
        } else {
          this.user = null;
        }
      });
    },

    // Connexion avec Google
    async signInWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        this.user = result.user;
        // Optionnel : Vous pouvez sauvegarder dans la DB des informations par défaut pour un nouvel utilisateur
        return this.user;
      } catch (error) {
        console.error("Erreur d'authentification via Google :", error);
        throw error;
      }
    },

    // Connexion avec email et mot de passe
    async loginWithEmail(email, password) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        this.user = result.user;
        return this.user;
      } catch (error) {
        console.error("Erreur de connexion via email :", error);
        throw error;
      }
    },

    // Inscription avec email et mot de passe
    async signupWithEmail(email, password, additionalData = {}) {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Mise à jour du profil dans Auth
        await updateProfile(result.user, {
          displayName: additionalData.fullName || additionalData.username || "",
        });
        // Stockage des données supplémentaires dans la DB
        await set(ref(db, `users/${result.user.uid}`), {
          fullName: additionalData.fullName || "",
          birthdate: additionalData.birthdate || "",
          username: additionalData.username || "",
          email: email,
        });
        // Mise à jour de l'état avec les infos fusionnées
        this.user = { ...result.user, ...additionalData };
        return this.user;
      } catch (error) {
        console.error("Erreur d'inscription via email :", error);
        throw error;
      }
    },

    // Mise à jour du profil utilisateur
    async updateUserProfile(updatedUser) {
      try {
        // Met à jour le displayName dans Firebase Auth
        await updateProfile(auth.currentUser, {
          displayName: updatedUser.fullName || updatedUser.username || "",
        });
        // Enregistre les champs supplémentaires dans la DB
        await set(ref(db, `users/${auth.currentUser.uid}`), {
          fullName: updatedUser.fullName || "",
          birthdate: updatedUser.birthdate || "",
          username: updatedUser.username || "",
          email: auth.currentUser.email, // L'email reste inchangé
        });
        // Met à jour l'état du store en fusionnant les données
        this.user = { ...auth.currentUser, ...updatedUser };
        return this.user;
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil utilisateur :", error);
        throw error;
      }
    },

    // Déconnexion
    async logout() {
      try {
        await signOut(auth);
        this.user = null;
      } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        throw error;
      }
    },
  },
});