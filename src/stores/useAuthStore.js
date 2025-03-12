// Gestion de l’état d’authentification et de l’utilisateur connecté, centralisée avec Pinia.
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
import User from "@/models/User";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: null, // Stocke l'utilisateur connecté et ses infos supplémentaires
  }),

  actions: {
    // Écoute les changements d'état de connexion et fusionne l’objet utilisateur de Firebase (user) et les infos supplémentaires depuis la DB additionalData)
    listenForAuthChanges() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const snapshot = await get(ref(db, `users/${user.uid}`));
            const additionalData = snapshot.exists() ? snapshot.val() : {};
            // Convertit les données en une instance de User en utilisant la méthode statique fromFirebase
            this.user = User.fromFirebase(user.uid, {
              uid: user.uid,
              ...additionalData,
              fullName: additionalData.fullName || user.displayName || "",
              dateOfBirth: additionalData.dateOfBirth || "",
              username: additionalData.username || "",
              email: user.email,
            });
          } catch (error) {
            console.error("Erreur lors de la récupération des infos supplémentaires :", error);
            this.user = user;
          }
        } else {
          this.user = null;
        }
      });
    },

    // Connexion avec Google en utilisant Realtime Database
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const authUser = result.user;
      const userRef = ref(db, `users/${authUser.uid}`);
      const snapshot = await get(userRef);
      let userProfile;

      if (snapshot.exists()) {
        // Document existant : récupérer les données enregistrées
        userProfile = { uid: authUser.uid, ...snapshot.val() };
      } else {
        // Document inexistant : créer un nouvel utilisateur avec des valeurs par défaut
        userProfile = {
          uid: authUser.uid, 
          fullName: authUser.displayName || "",
          email: authUser.email,
          dateOfBirth: "", // valeur par défaut, à compléter ultérieurement par l'utilisateur
          username: authUser.email ? authUser.email.split("@")[0] : "",
        };
        // Enregistrer le nouveau profil dans la Realtime Database
        await set(userRef, userProfile);
      }

      // Mettre à jour le store
      this.user = userProfile;
      console.log("Store mis à jour via Google:", this.user);
    },

    // Connexion avec email et mot de passe
    async loginWithEmail(email, password) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        // Récupérer les données supplémentaires depuis la Realtime Database
        const userRef = ref(db, `users/${result.user.uid}`);
        const snapshot = await get(userRef);
        const additionalData = snapshot.exists() ? snapshot.val() : {};
        // Mettre à jour le store en s'assurant d'avoir uid
        this.user = {
          uid: result.user.uid,
          ...additionalData,
          fullName: additionalData.fullName || result.user.displayName || "",
          email: result.user.email,
        };
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
          dateOfBirth: additionalData.dateOfBirth || "",
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