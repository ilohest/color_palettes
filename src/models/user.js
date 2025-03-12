// Modèle objet pour les utilisateurs de l'application
// Définit une classe qui représente la structure et le comportement d’un utilisateur
// Centralise la logique de gestion des données utilisateur: facilite la validation, la transformation et la réutilisation de la structure utilisateur dans toute l’application
//----------------------------------------------------

export default class User {
  constructor(id, fullName, dateOfBirth, username, email, profilePic = "") {
    this.id = id; // Identifiant unique (peut être défini par Firebase ou généré)
    this.uid = id; 
    this.fullName = fullName; // Nom complet de l'utilisateur
    this.dateOfBirth = dateOfBirth; // Format ISO ou autre format choisi
    this.username = username;
    this.email = email;
    this.profilePic = profilePic;
  }

  // Méthode pour vérifier que les données obligatoires sont renseignées
  isValid() {
    // On exige que le fullName et l'email soient définis
    return !!(this.fullName && this.email);
  }

  // Méthode pour convertir l'instance en objet adapté pour Firebase
  toFirebaseObject() {
    return {
      fullName: this.fullName,
      dateOfBirth: this.dateOfBirth,
      username: this.username,
      email: this.email,
      profilePic: this.profilePic,
    };
  }

  // Méthode statique pour créer une instance à partir d'une donnée récupérée dans Firebase
  static fromFirebase(id, data) {
    return new User(
      id,
      data.fullName,
      data.dateOfBirth,
      data.username,
      data.email,
      data.profilePic
    );
  }
}
