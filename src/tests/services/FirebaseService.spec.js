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
  it('doit ajouter une palette si l’utilisateur est connecté', async () => {
    const mockRefPalettes = {}             // Ce sera le résultat de ref(db, "palettes")
    const mockRefNewPalette = { key: 'palette123' } // Ce que push renvoie
  
    ref.mockReturnValue(mockRefPalettes)
    push.mockReturnValue(mockRefNewPalette)
  
    await FirebaseService.addPalette(['#123456'])
  
    expect(ref).toHaveBeenCalledWith(expect.any(Object), 'palettes')
    expect(push).toHaveBeenCalledWith(mockRefPalettes)
    expect(set).toHaveBeenCalledWith(mockRefNewPalette, {
      colors: ['#123456'],
      createdBy: 'user123',
      createdAt: expect.any(String),
    })
  })
  

  // deletePalette : vérifier que la palette est supprimée correctement
  it('doit supprimer une palette correctement', async () => {
    await FirebaseService.deletePalette({ id: 'palette1', createdBy: 'user123' })
    expect(remove).toHaveBeenCalled()
  })

  // Cas erreur deletePalette : utilisateur non propriétaire
  it('ne doit pas supprimer si l’utilisateur n’est pas propriétaire', async () => {
    auth.currentUser.uid = 'differentUser'
    
    const palette = { id: 'palette1', createdBy: 'user123' }
  
    await expect(FirebaseService.deletePalette(palette)).rejects.toThrow()
  })

  // fetchPalettes : vérifier que les palettes sont récupérées depuis Firebase
  it('doit récupérer des palettes depuis Firebase', () => {
    const mockFirebasePalettes = {
      palette1: {
        colors: ['#FFFFFF'],
        createdBy: 'user123',
        createdAt: new Date().toISOString(),
      },
    }
  
    onValue.mockImplementation((ref, callback) => {
      callback({ val: () => mockFirebasePalettes })
    })
  
    const callback = vi.fn()
  
    FirebaseService.fetchPalettes(callback)
  
    expect(callback).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'palette1',
        colors: ['#FFFFFF'],
        createdBy: 'user123',
        createdAt: expect.any(String),
      }),
    ])
  })  
 
  // updatePalette : vérifier que la palette est mise à jour
  it('doit mettre à jour une palette', async () => {
    const mockRef = {}
    ref.mockReturnValue(mockRef)
    
    const palette = { id: 'palette1', colors: ['#000'] }
    await FirebaseService.updatePalette(palette)
    
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'palettes/palette1')
    expect(set).toHaveBeenCalledWith(mockRef, palette)
  })

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
