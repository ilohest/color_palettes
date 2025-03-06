// Modèle objet pour une palette de couleurs
// Pour structurer et valider les données avant de les enregistrer ou après les avoir récupérées de Firebase
//------------------------------------------------------------

export default class Palette {
    // Propriétés de la classe
    constructor(id, colors, createdBy, createdAt = null) {
      this.id = id; // L'identifiant Firebase (optionnel pour les nouvelles palettes)
      this.colors = colors;
      this.createdBy = createdBy;
      this.createdAt = createdAt || new Date().toISOString();
    }
  
    // Méthodes de la classe
    // ✅ Vérifie que chaque couleur est au format hexadécimal (ex: "#AABBCC")
    isValid() {
        return (
        //Array.isArray(this.colors) &&
        this.colors.length > 0 //&&
        //this.colors.every(color => /^#[0-9A-Fa-f]{6}$/.test(color))
        );
    }
  
    // ✅ Renvoie un objet prêt pour Firebase
    toFirebaseObject() {
      return {
        colors: this.colors,
        createdBy: this.createdBy,
        createdAt: this.createdAt
      };
    }
  
    // ✅ Crée une instance de Palette à partir des données Firebase
    static fromFirebase(id, data) {
      //console.log("*Palette.js : Conversion Firebase -> Palette :", id, data);
      return new Palette(id, data.colors || [], data.createdBy, data.createdAt);
    }
  }
  