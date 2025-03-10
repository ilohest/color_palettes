import { describe, it, expect, vi, beforeEach } from 'vitest'
import FirebaseService from '@/services/FirebaseService.js'
import { ref, set, push, onValue, remove } from 'firebase/database'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth } from '@/services/FirebaseConfig.js'
import Palette from '@/models/Palette.js'

// Mock de firebase/database
// ref :obtient une référence à une chemin précis de la base de données
// set : simule l'écriture des données dans la base de données (ici toujours réussie grâce à mockResolvedValue())
// push : simule l'ajout d'une nouvelle palette dans la base de données (renvoie une clé unique)
// onValue : simule la récupération des données depuis Firebase (lecture en temps réel)
// remove : simule la suppression d'une palette dans la base de données (toujouts réussie grâce à mockResolvedValue())
vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn().mockResolvedValue(),
  push: vi.fn(() => ({ key: 'newPaletteRef' })),
  onValue: vi.fn(),
  remove: vi.fn().mockResolvedValue(),
}))

// Mock de firebase/auth
// signInWithPopup : simule l'authentification avec un fournisseur comme Google
// signOut : simule la déconnexion réussie de l'utilisateur
// GoogleAuthProvider : constructeur simulé pour l'authentification avec Google
// getAuth : simule la récupération de l'objet authentification de Firebase
vi.mock('firebase/auth', () => ({
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    getAuth: vi.fn(),
}))

// Mock de FirebaseConfig.js : simule mon propre fichier où j'ai as configuré Firebase
// auth : utilisateur actuellement connecté (auth.currentUser) est déjà défini, ce qui permet de tester les fonctions dépendantes d'un utilisateur connecté
// db : simule que la base de données Firebase existe mais n'est pas utilisée dans les tests
vi.mock('@/services/FirebaseConfig.js', () => ({
  auth: { currentUser: { uid: 'user123' } },
  db: {},
}))

describe('FirebaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Tests
  // addPalette : vérifier que la palette est ajoutée si l’utilisateur est connecté
  it('ajoute une palette valide via FirebaseService.addPalette', async () => {
    const colors = ['#FFFFFF'];
  
    // On suppose que auth.currentUser.uid est "user123"
    const expectedPalette = new Palette(null, colors, 'user123');
    
    // On suppose que la palette est valide
    // Simuler le push pour retourner une référence fictive
    const mockRef = { key: 'palette123' };
    push.mockReturnValue(mockRef);
    
    await FirebaseService.addPalette(colors);
    
    // Vérifie que set a été appelé avec la référence retournée par push
    // et l'objet retourné par expectedPalette.toFirebaseObject()
    expect(set).toHaveBeenCalledWith(mockRef, expectedPalette.toFirebaseObject());
  })
  

  // deletePalette : vérifier que la palette est supprimée correctement
  it('supprime une palette via FirebaseService.deletePalette si l’utilisateur est le créateur', async () => {
    // Simuler que l'utilisateur connecté est obtenu via getCurrentUser
    // On peut, dans le test, considérer que auth.currentUser.uid === 'user123'
    // Simuler une palette avec createdBy 'user123'
    const palette = { 
      id: 'palette1', 
      colors: ['#FFFFFF'], 
      createdBy: 'user123', 
      createdAt: '2025-03-07T12:00:00Z'
    };
  
    // Mocker ref() pour retourner un objet fictif
    const mockRef = {};
    ref.mockReturnValue(mockRef);
  
    await FirebaseService.deletePalette(palette);
  
    // Vérifier que ref est appelé avec le chemin "palettes/palette1" et remove est appelé avec ce mock
    expect(ref).toHaveBeenCalledWith(expect.anything(), `palettes/${palette.id}`);
    expect(remove).toHaveBeenCalledWith(mockRef);
  });
  

  // Cas erreur deletePalette : cas où l'utilisateur n'est pas le propriétaire
  it('lance une erreur lors de la suppression si l’utilisateur n’est pas le créateur', async () => {
    const palette = { 
      id: 'palette1', 
      colors: ['#FFFFFF'], 
      createdBy: 'otherUser', 
      createdAt: '2025-03-07T12:00:00Z'
    };
  
    // Supposons que getCurrentUser retourne un utilisateur dont uid est 'testUser'
    await expect(FirebaseService.deletePalette(palette)).rejects.toThrow("Vous ne pouvez supprimer que vos propres palettes !");
  });  

  // fetchPalettes : vérifier que les palettes sont récupérées depuis Firebase
  it('récupère et convertit correctement les palettes via FirebaseService.fetchPalettes', () => {
    // Simuler des données provenant de Firebase
    const fakeData = {
      palette1: {
        colors: ['#FFFFFF'],
        createdBy: 'testUser',
        createdAt: '2025-03-07T12:00:00Z'
      },
      palette2: {
        colors: ['#000000'],
        createdBy: 'otherUser',
        createdAt: '2025-03-07T11:00:00Z'
      }
    };
  
    // Configurer le mock pour onValue afin de simuler le snapshot Firebase
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => fakeData });
    });
    
    // Créer une fonction callback spy
    const callback = vi.fn();
    
    // Appeler la méthode fetchPalettes sans filtrage
    FirebaseService.fetchPalettes(callback);
    
    // Construire le tableau attendu en utilisant Palette.fromFirebase
    const expectedPalettes = Object.keys(fakeData).map(id => Palette.fromFirebase(id, fakeData[id]));
    
    // Vérifier que le callback a été appelé avec le tableau attendu
    expect(callback).toHaveBeenCalledWith(expectedPalettes);
  }); 
 
  // updatePalette : vérifier que la palette est mise à jour
  it('met à jour une palette via FirebaseService.updatePalette', async () => {
    // Simuler un paletteData à mettre à jour
    const paletteData = { 
      id: 'palette1', 
      colors: ['#FFFFFF', '#000000'], 
      createdBy: 'testUser', 
      createdAt: '2025-03-07T12:00:00Z'
    };
  
    // Créer une instance de Palette avec les mêmes données
    const paletteInstance = new Palette(
      paletteData.id,
      paletteData.colors,
      paletteData.createdBy,
      paletteData.createdAt
    );
    
    // On s'attend à ce que set soit appelé avec ref(db, `palettes/${paletteData.id}`) et l'objet issu de toFirebaseObject()
    const mockRef = {}; 
    ref.mockReturnValue(mockRef);
  
    await FirebaseService.updatePalette(paletteData);
    
    expect(ref).toHaveBeenCalledWith(expect.anything(), `palettes/${paletteData.id}`);
    expect(set).toHaveBeenCalledWith(mockRef, paletteInstance.toFirebaseObject());
  }); 

  // signInWithGoogle : vérifier que l’utilisateur est connecté via Google
  it('doit connecter l’utilisateur via Google', async () => {
    const mockUser = { uid: 'user123', email: 'test@user.com' }
    signInWithPopup.mockResolvedValue({ user: mockUser })
  
    const user = await FirebaseService.signInWithGoogle()
  
    expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(GoogleAuthProvider))
    expect(user).toEqual(mockUser)
  })

  // logout : vérifier que l’utilisateur est déconnecté
  it('doit déconnecter l’utilisateur', async () => {
    signOut.mockResolvedValue()
  
    await FirebaseService.logout()
  
    expect(signOut).toHaveBeenCalledWith(auth)
  })

  //getCurrentUser : vérifier que l’utilisateur est récupéré
  it('doit déconnecter l’utilisateur', async () => {
    signOut.mockResolvedValue()
  
    await FirebaseService.logout()
  
    expect(signOut).toHaveBeenCalledWith(auth)
  })
  
})
