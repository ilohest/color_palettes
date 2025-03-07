import { describe, beforeEach, it, expect, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePaletteStore } from '@/stores/usePaletteStore'
import FirebaseService from '@/services/FirebaseService.js'

// Mock de FirebaseService (faux objet ou une fausse fonction qui imite un comportement précis, remplace une dépendance externe (base de données, appel réseau, API, etc.))
// Simulation d'un élément externe dont dépend ton code, permettant de tester uniquement ton code, sans risque d'effets secondaires
// Va simuler le simuler le comportement de Firebase pour que les tests fonctionnent sans dépendre de l'API réelle 
vi.mock('@/services/FirebaseService.js', () => ({
    __esModule: true,
    default: {
      fetchPalettes: vi.fn((callback) => callback([
        { id: '1', colors: ['#FFFFFF'], createdBy: 'user1' },
        { id: '2', colors: ['#000000'], createdBy: 'user2' },
      ])),
      addPalette: vi.fn().mockResolvedValue(),
      deletePalette: vi.fn().mockResolvedValue(),
      updatePalette: vi.fn().mockResolvedValue(),
    },
}))
  
describe('usePaletteStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia()) // Active Pinia pour chaque test
    store = usePaletteStore()

    // État initial
    store.palettes = [
      { id: '1', colors: ['#FFFFFF'], createdBy: 'user1' },
      { id: '2', colors: ['#000000'], createdBy: 'user2' },
    ]
  })

  // Tests
  //getPaletteById: vérifier que la bonne palette est retournée selon un ID
  it('devrait retourner la palette correcte selon son ID', () => {
    const palette = store.getPaletteById('1')
    expect(palette).toEqual({ id: '1', colors: ['#FFFFFF'], createdBy: 'user1' })
  })

  //fetchPalettes: vérifier que les palettes sont récupérées
  it('devrait charger les palettes via FirebaseService', async () => {
    await store.fetchPalettes()

    expect(FirebaseService.fetchPalettes).toHaveBeenCalled()
    expect(store.palettes.length).toBe(2)
  })

  //addPalette: vérifier que Firebase est appelé, puis les palettes sont rechargées après ajout
  it('devrait ajouter une palette (addPalette) et recharger les palettes (fetchPalettes) après ajout', async () => { //déclaration du test
    await store.addPalette(['#123456']) // le test appelle la méthode réelle définie dans mon store : « que se passe-t-il quand un utilisateur ajoute une palette ? »

    expect(FirebaseService.addPalette).toHaveBeenCalledWith(['#123456']) // Première assertion (vérification) : vérifier que FirebaseService.addPalette (fonction mockée) a bien été appelée avec la bonne palette (['#123456'])
    expect(FirebaseService.fetchPalettes).toHaveBeenCalled() // Deuxième assertion (vérification) : vérifier qu'après avoir ajouté la palette, FirebaseService.fetchPalettes (fonction mockée) a bien été appelée pour rafraîchir la liste des palettes
  })

  //deletePalette: vérifier que Firebase est appelé, puis les palettes sont rechargées après suppression du store
  it('devrait supprimer une palette et actualiser la liste', async () => {
    await store.deletePalette('1')

    expect(FirebaseService.deletePalette).toHaveBeenCalledWith({
      id: '1',
      createdBy: 'user1',
    })
    expect(store.palettes).toHaveLength(1)
    expect(store.palettes).not.toContainEqual({ id: '1', colors: ['#FFFFFF'], createdBy: 'user1' })
  })

  //updatePalette: vérifier que Firebase est appelé pour mettre à jour une palette et que la palette est mise à jour
  it('devrait mettre à jour une palette existante', async () => {
    const updatedPalette = { id: '2', colors: ['#00FF00'], createdBy: 'user2' }

    await store.updatePalette(updatedPalette)

    expect(FirebaseService.updatePalette).toHaveBeenCalledWith(updatedPalette)
    expect(store.palettes).toContainEqual(updatedPalette)
  })
})