// Contient la logique de communication avec Firebase: les services interagissent avec des APIs externes
// Ce fichier contient les fonctions pour gérer l'authentification, les palettes et les utilisateurs sur Firebase.
// Ces méthodes encapsulent les appels aux API Firebase (Realtime Database, Auth, etc.) et facilitent leur utilisation dans les composants / stores.
//------------------------------------------------------------------------------------------------------------------------------------------------

import { db, auth } from "./FirebaseConfig.js";
import { ref, set, push, onValue, remove } from "firebase/database";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import Palette from "../models/Palette.js";

const provider = new GoogleAuthProvider();

export default class FirebaseService {
  // 🔥 Connexion avec Google
  static async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("FirebaseService.js : Erreur d'authentification :", error);
      return null;
    }
  }

  // 🔥 Déconnexion de l'utilisateur
  static async logout() {
    await signOut(auth);
  }

  // 🔥 Récupérer l'utilisateur connecté
  static getCurrentUser() {
    return auth.currentUser;
  }

  // 🔥 Ajouter une palette avec la classe `Palette`
  static async addPalette(colors) {
    const user = this.getCurrentUser();
    if (!user) {
      console.error("❌ FirebaseService.js : Utilisateur non connecté !");
      throw new Error("Utilisateur non connecté !");
    }
  
    const newPaletteRef = push(ref(db, "palettes"));
    const newPalette = {
      colors: colors,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    };
  
    //console.log("🔥 FirebaseService.js : Enregistrement de la palette sur Firebase :", newPalette);
    return set(newPaletteRef, newPalette);
  }
  

   // 🔥 Supprimer une palette si l'utilisateur est le propriétaire
   static async deletePalette(palette) {
      const user = this.getCurrentUser();

      //console.log("🔍 FirebaseService.js : Suppression demandée par :", user ? user.uid : "Aucun utilisateur détecté");
      //console.log("📌 FirebaseService.js : Propriétaire de la palette :", palette.createdBy);
      
      if (!user) {
        throw new Error("Utilisateur non connecté !");
      }
      if (user.uid !== palette.createdBy) {
        throw new Error("Vous ne pouvez supprimer que vos propres palettes !");
      }

      const paletteRef = ref(db, `palettes/${palette.id}`);
      return remove(paletteRef);
  }


  // 🔥 Récupérer les palettes et les convertir en objets `Palette`
  static fetchPalettes(callback, userId = null) {
    const palettesRef = ref(db, "palettes");

    onValue(palettesRef, (snapshot) => {
      const data = snapshot.val();
      let palettes = [];

      if (data) {
        palettes = Object.keys(data).map(id => Palette.fromFirebase(id, data[id]));

        if (userId) {
          palettes = palettes.filter(palette => palette.createdBy === userId);
        }
      }

      callback(palettes);
    });
  }

  // 🔥 Mettre à jour une palette
  static async updatePalette(palette) {
    const paletteRef = ref(db, `palettes/${palette.id}`);
    return set(paletteRef, palette);
  }  
}