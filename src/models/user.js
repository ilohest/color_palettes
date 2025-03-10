// Modèle pour les utilisateurs de l'application
//----------------------------------------------

export default class User {
    constructor(id, firstName, lastName, dateOfBirth, username, email, profilePic = "") {
      this.id = id; // Identifiant unique (peut être défini par Firebase ou généré)
      this.firstName = firstName;
      this.lastName = lastName;
      this.dateOfBirth = dateOfBirth; // Format ISO ou autre format choisi
      this.username = username;
      this.email = email;
      this.profilePic = profilePic;
    }
  
    // Méthode pour vérifier que les données obligatoires sont renseignées
    isValid() {
      // Par exemple, on exige que le prénom, le nom et l'email soient définis
      return !!(this.firstName && this.lastName && this.email);
    }
  
    // Méthode pour convertir l'instance en objet adapté pour Firebase
    toFirebaseObject() {
      return {
        firstName: this.firstName,
        lastName: this.lastName,
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
        data.firstName,
        data.lastName,
        data.dateOfBirth,
        data.username,
        data.email,
        data.profilePic
      );
    }
  }
  