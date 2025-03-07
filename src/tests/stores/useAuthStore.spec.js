import { describe, beforeEach, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'

// Mock de firebase/auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(),
}))

describe('useAuthStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAuthStore()
    store.user = null // Réinitialise l'état avant chaque test
  })

  // Tests

  // Tester l’initialisation du state
  it('doit initialiser l’état avec user à null', () => {
    expect(store.user).toBe(null)
  })

  // signInWithGoogle : vérifier que l’utilisateur est connecté via Google et stocké dans l’état après la connexion
  it('doit connecter un utilisateur via Google', async () => {
    const mockUser = { uid: 'abc123', email: 'user@test.com' }
    signInWithPopup.mockResolvedValue({ user: mockUser })

    await store.signInWithGoogle()

    expect(signInWithPopup).toHaveBeenCalled()
    expect(store.user).toEqual(mockUser)
  })

  // logout : vérifier que l’utilisateur est déconnecté et que l’état est mis à jour (null)
  it('doit déconnecter un utilisateur', async () => {
    store.user = { uid: 'abc123', email: 'user@test.com' }
    signOut.mockResolvedValue()

    await store.logout()

    expect(signOut).toHaveBeenCalled()
    expect(store.user).toBeNull()
  })

  // onAuthStateChanged : vérifier que l’utilisateur est mis à jour dans l’état après un changement d’état de connexion
  it('doit détecter le changement d’état utilisateur (connexion/déconnexion)', () => {
    const mockUser = { uid: 'xyz456', email: 'user2@test.com' }
    onAuthStateChanged.mockImplementation((auth, callback) => callback(mockUser))

    store.listenForAuthChanges()

    expect(onAuthStateChanged).toHaveBeenCalled()
    expect(store.user).toEqual(mockUser)
  })
})
