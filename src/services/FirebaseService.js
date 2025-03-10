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
  
    // Création d'une instance de la classe Palette (id est null pour une nouvelle palette)
    const newPalette = new Palette(null, colors, user.uid);
    // Vérifier que la palette est valide avant de l'enregistrer (méthode de Palette)
    if (!newPalette.isValid()) {
      throw new Error("Palette invalide !");
    }
    
    const newPaletteRef = push(ref(db, "palettes"));
    //console.log("🔥 FirebaseService.js : Enregistrement de la palette sur Firebase :", newPalette);
    // Utiliser toFirebaseObject pour transformer l'objet en format adapté à Firebase
    return set(newPaletteRef, newPalette.toFirebaseObject());
  }
  
  // 🔥 Supprimer une palette si l'utilisateur est le propriétaire
  static async deletePalette(palette) {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("Utilisateur non connecté !");
    }
    if (user.uid !== palette.createdBy) {
      throw new Error("Vous ne pouvez supprimer que vos propres palettes !");
    }
    //console.log("🔍 FirebaseService.js : Suppression demandée par :", user ? user.uid : "Aucun utilisateur détecté");
    //console.log("📌 FirebaseService.js : Propriétaire de la palette :", palette.createdBy);
    
    const paletteRef = ref(db, `palettes/${palette.id}`);
    return remove(paletteRef);
  }

  // 🔥 Récupérer les palettes et les convertir en instances de Palette
  static fetchPalettes(callback, userId = null) {
    const palettesRef = ref(db, "palettes");

    onValue(palettesRef, (snapshot) => {
      const data = snapshot.val();
      let palettes = [];

      if (data) {
        // Palette.fromFirebase convertit les objets + propriétés (colors, createdBy, etc.) récupérés de Firebase en instances de Palette
        palettes = Object.keys(data).map(id => Palette.fromFirebase(id, data[id])); 
        if (userId) {
          palettes = palettes.filter(palette => palette.createdBy === userId);
        }
      }
      callback(palettes);
    });
  }

  // 🔥 Mettre à jour une palette en utilisant la classe Palette pour la validation et la conversion
  static async updatePalette(paletteData) {
    const paletteRef = ref(db, `palettes/${paletteData.id}`);
    // Créer une instance de Palette avec les données existantes
    const paletteInstance = new Palette(
      paletteData.id,
      paletteData.colors,
      paletteData.createdBy,
      paletteData.createdAt
    );
    if (!paletteInstance.isValid()) {
      throw new Error("Palette invalide !");
    }
    // Utiliser toFirebaseObject pour transformer l'objet en format adapté à Firebase
    return set(paletteRef, paletteInstance.toFirebaseObject());
  }
}