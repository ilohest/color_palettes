import { shallowMount } from '@vue/test-utils' // Cela monte Home.vue sans rendre en profondeur ses composants enfants (ils sont automatiquement remplacés par des stubs). Cela permet de se concentrer sur la logique et l'interface de Home.vue.
import { createTestingPinia } from '@pinia/testing' // Simuler les stores utilisés par Home.vue sans avoir besoin d’un backend réel. Permet de contrôler l’état des stores (par exemple, définir authStore.user ou paletteStore.palettes).
import Home from '@/views/Home.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePaletteStore } from '@/stores/usePaletteStore'
import { h } from 'vue'

describe('Home.vue', () => {
  let wrapper, authStore, paletteStore

  beforeEach(() => {
    // Crée un Pinia de test avec createTestingPinia
    wrapper = shallowMount(Home, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          // Stub personnalisé pour Button qui rend le label dans le markup
          Button: {
            name: 'Button',
            template: '<button @click="$emit(\'click\')">{{ label }}</button>',
            props: ['label'],
          },
          // Stub personnalisé pour PaletteCard qui affiche un bouton delete si palette.createdBy === user.uid
          PaletteCard: {
            name: 'PaletteCard',
            template: `
              <div>
                <span class="palette-id">{{ palette.id }}</span>
                <button v-if="user && palette.createdBy === user.uid" class="delete-btn">Delete</button>
              </div>
            `,
            props: ['palette', 'user'],
          },
          // Stub pour draggable qui rend le slot et transmet les événements
draggable: {
  name: 'draggable',
  setup(props, { attrs, slots, emit }) {
    // Retourne un élément div qui transmet tous les $attrs (y compris les écouteurs)
    // et définit explicitement onEnd pour émettre "end"
    return () => h('div', { ...attrs, onEnd: () => emit('end') }, slots.default ? slots.default() : [])
  },
},
        
        },
      },
    })

    // Récupère les stores via le hook
    authStore = useAuthStore()
    paletteStore = usePaletteStore()

    // Configure l'état initial pour les tests : 
    // 1) simulons qu'un utilisateur est connecté
    authStore.user = { uid: 'testUser', name: 'Test' }

    // 2) simulons qu'il y a quelques palettes
    paletteStore.palettes = [
      { id: 'palette1', colors: ['#FFFFFF'], createdBy: 'testUser', createdAt: new Date().toISOString() },
      { id: 'palette2', colors: ['#000000'], createdBy: 'testUser', createdAt: new Date().toISOString() },
    ]
  })

  // Vérifier que le bouton "+ New palette" s'affiche quand un utilisateur est connecté
  // Ce test vérifie que le composant Button est rendu (ce qui est conditionné par la présence d'un utilisateur connecté, simulé plus haut avec authStore.user).
  it('affiche le bouton "New palette" quand un utilisateur est connecté', () => {
    // Recherche du composant Button stubbed
    const newPaletteButton = wrapper.findComponent({ name: 'Button' })

    // Vérifie que le bouton est rendu
    expect(newPaletteButton.exists()).toBe(true)
  })

  // Vérifier que si aucune palette n'est présente, le message "Aucune palette enregistrée." est affiché
  it('affiche un message quand aucune palette n\'est enregistrée', async () => {
    // Simuler qu'il n'y a aucune palette dans le store
    paletteStore.palettes = []

    // Forcer la réévaluation des computed properties
    await wrapper.vm.$nextTick()

    // Vérifie que le message est affiché
    expect(wrapper.text()).toContain('Aucune palette enregistrée.')
  })

  // Tester l'ouverture du formulaire de création
  it('ouvre le formulaire de création quand on clique sur "New palette"', async () => {
    // showPaletteForm est initialement false
    expect(wrapper.vm.showPaletteForm).toBe(false) // Vérifie que la propriété showPaletteForm (qui contrôle l'affichage du formulaire) est initialement false (=formuaire non affiché)

    // Trouve le bouton "+ New palette" et déclenche un clic
    const newPaletteButton = wrapper.findComponent({ name: 'Button' })
    await newPaletteButton.trigger('click')

    // Vérifie que showPaletteForm devient true
    expect(wrapper.vm.showPaletteForm).toBe(true) // Ce changement d'état indique que la méthode (openCreateForm - cf. Home.vue) a été exécutée

    // Vérifie si PaletteForm est rendu lorsque showPaletteForm est true
    const paletteForm = wrapper.findComponent({ name: 'PaletteForm' })
    expect(paletteForm.exists()).toBe(true)
  })

  // Tester la computed property "displayedPalettes" qui détermine quelles palettes doivent être affichées dans la vue
  it('calcule correctement les palettes affichées', async () => {
    // Ici, par défaut, displayedPalettes doit contenir toutes les palettes
    let displayed = wrapper.vm.displayedPalettes
    expect(displayed.length).toBe(2)

    // Si showUserPalettes est activé et que l'utilisateur correspond, on peut filtrer
    // Si showUserPalettes est activé, on s'attend à ce que seules les palettes de l'utilisateur connecté soient affichées.
    // Dans ce test, toutes les palettes ont été créées par "testUser", donc le résultat reste 2.
    wrapper.vm.showUserPalettes = true
    await wrapper.vm.$nextTick()
    displayed = wrapper.vm.displayedPalettes
    // Dans notre cas, toutes les palettes ont été créées par "testUser"
    expect(displayed.length).toBe(2)
  })

  // Vérifier que la grille affiche bien les PaletteCard
  it('affiche une PaletteCard par palette dans la grille', () => {
    // Grâce à shallowMount, les composants enfants sont stubbed (ex. <PaletteCard-stub>)
    const paletteCards = wrapper.findAllComponents({ name: 'PaletteCard' })
    expect(paletteCards.length).toBe(2)
  })

  // Vérifier que le filtre par utilisateur fonctionne correctement
  // Lorsque le toggle « showUserPalettes » est activé, seules les palettes dont le champ createdBy correspond à l’utilisateur connecté apparaissent dans la computed property displayedPalettes
  it('filtre les palettes pour n\'afficher que celles de l\'utilisateur connecté lorsque showUserPalettes est activé', async () => {
    // Simule des palettes avec des créateurs différents
    paletteStore.palettes = [
      { id: 'palette1', colors: ['#FFFFFF'], createdBy: 'testUser', createdAt: '2025-03-07T12:00:00Z' },
      { id: 'palette2', colors: ['#000000'], createdBy: 'otherUser', createdAt: '2025-03-07T11:00:00Z' },
    ]
  
    // Simule un utilisateur connecté (déjà configuré dans le test Pinia)
    authStore.user = { uid: 'testUser' }
    // Désactive le filtrage par défaut
    wrapper.vm.showUserPalettes = false
    await wrapper.vm.$nextTick()
    
    // Par défaut, toutes les palettes sont affichées
    expect(wrapper.vm.displayedPalettes.length).toBe(2)
  
    // Active le filtre
    wrapper.vm.showUserPalettes = true
    await wrapper.vm.$nextTick()
    
    // Vérifie que seules les palettes créées par testUser sont affichées
    const displayed = wrapper.vm.displayedPalettes
    expect(displayed.length).toBe(1)
    expect(displayed[0].createdBy).toBe('testUser')
  })

  // Vérifier que le tri par date fonctionne correctement
  // Lorsque le toggle « sortByDate » est activé, les palettes sont triées par ordre décroissant de date de création : vérifier l'ordre
  it('trie les palettes par date décroissante par défaut', async () => {
    // Crée deux palettes avec des dates différentes
    paletteStore.palettes = [
      { id: 'palette1', colors: ['#FFFFFF'], createdBy: 'testUser', createdAt: '2025-03-07T12:00:00Z' },
      { id: 'palette2', colors: ['#000000'], createdBy: 'testUser', createdAt: '2025-03-07T13:00:00Z' },
    ]
  
    // Désactive le tri aléatoire
    wrapper.vm.randomOrder = false
    await wrapper.vm.$nextTick()
  
    const displayed = wrapper.vm.displayedPalettes
    // Attendu : la palette2 (plus récente) doit être en premier
    expect(displayed[0].id).toBe('palette2')
    expect(displayed[1].id).toBe('palette1')
  })

  // Vérifier que le tri aléatoire fonctionne correctement
  // Lorsque le toggle « randomOrder » est activé, les palettes sont triées aléatoirement : vérifier que l'ordre change
  it('modifie l\'ordre des palettes lorsque randomOrder est activé', async () => {
    // Définir un jeu de palettes dans un ordre précis
    paletteStore.palettes = [
      { id: 'palette1', colors: ['#111111'], createdBy: 'testUser', createdAt: '2025-03-07T10:00:00Z' },
      { id: 'palette2', colors: ['#222222'], createdBy: 'testUser', createdAt: '2025-03-07T11:00:00Z' },
      { id: 'palette3', colors: ['#333333'], createdBy: 'testUser', createdAt: '2025-03-07T12:00:00Z' },
    ]
  
    // Désactiver le tri aléatoire pour obtenir l'ordre par défaut
    wrapper.vm.randomOrder = false
    await wrapper.vm.$nextTick()
    const defaultOrder = wrapper.vm.displayedPalettes.map(p => p.id)
  
    // Active le tri aléatoire
    // Pour obtenir un résultat différent, on peut stubber Math.random pour renvoyer différentes valeurs.
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.3)
    wrapper.vm.randomOrder = true
    await wrapper.vm.$nextTick()
    const randomOrder = wrapper.vm.displayedPalettes.map(p => p.id)
  
    // On s'attend à ce que l'ordre soit différent
    expect(randomOrder).not.toEqual(defaultOrder)
  
    randomSpy.mockRestore()
  })
  
  // Vérifier que la fonctionnalité de modification (édition) est limitée aux palettes dont le champ createdBy correspond à l'ID de l'utilisateur connecté
  // Tester la computed property isPaletteEditable
  it('indique que la palette est modifiable seulement si l’utilisateur est le créateur', async () => {
    // La computed property "isPaletteEditable" retourne true si selectedPalette.createdBy === user.uid.
    // On teste d'abord avec une palette créée par l'utilisateur connecté.
    wrapper.vm.selectedPalette = { id: 'palette1', colors: ['#FFFFFF'], createdBy: 'testUser' }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isPaletteEditable).toBe(true)
  
    // Puis on teste avec une palette créée par un autre utilisateur.
    wrapper.vm.selectedPalette = { id: 'palette2', colors: ['#000000'], createdBy: 'otherUser' }
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isPaletteEditable).toBe(false)
  })

  // Vérifier que le bouton de suppression est affiché uniquement pour les palettes créées par l'utilisateur connecté
  it('affiche le bouton de suppression uniquement pour les palettes créées par l’utilisateur connecté', async () => {
    await wrapper.vm.$nextTick()

    // Récupère toutes les PaletteCard
    const paletteCards = wrapper.findAllComponents({ name: 'PaletteCard' })
    expect(paletteCards.length).toBe(2)

    // Pour chaque carte, on vérifie la présence ou l'absence du bouton delete selon le créateur
    paletteCards.forEach(card => {
      const palette = card.props().palette
      const deleteBtn = card.find('.delete-btn')
      if (palette.createdBy === 'testUser') {
        // Pour la palette du connecté, le bouton doit être présent
        expect(deleteBtn.exists()).toBe(true)
      } else {
        // Pour une palette d'un autre utilisateur, le bouton ne doit pas être présent
        expect(deleteBtn.exists()).toBe(false)
      }
    })
  })

  // viewPalette et closeOverlay : vérifie que lorsqu'on appelle la méthode viewPalette, l'overlay s'affiche avec les détails de la palette, et qu'en appelant closeOverlay, l'overlay disparaît
  it('affiche l’overlay avec les détails de la palette quand on clique sur une palette et le ferme correctement', async () => {
    // Simuler une palette sélectionnée via viewPalette
    const palette = { id: 'palette1', colors: ['#FFFFFF'], createdBy: 'testUser', createdAt: new Date().toISOString() }
    wrapper.vm.viewPalette(palette)
    await wrapper.vm.$nextTick()
    
    // Vérifie que selectedPalette est défini et que l'overlay est présent dans le DOM
    expect(wrapper.vm.selectedPalette).toEqual(palette)
    expect(wrapper.find('.overlay').exists()).toBe(true)
    
    // Simuler la fermeture de l'overlay
    wrapper.vm.closeOverlay()
    await wrapper.vm.$nextTick()
    
    // Vérifie que selectedPalette est remis à null et que l'overlay disparaît
    expect(wrapper.vm.selectedPalette).toBeNull()
    expect(wrapper.find('.overlay').exists()).toBe(false)
  })
  
  // editPalette : vérifie que lorsqu'on appelle la méthode editPalette, editingPalette est mis à jour avec une copie de la palette transmise et que showPaletteForm passe à true pour afficher le formulaire
  it('ouvre le formulaire d’édition avec les données de la palette lorsqu\'editPalette est appelée', async () => {
    const palette = { id: 'palette1', colors: ['#FFFFFF', '#000000'], createdBy: 'testUser', createdAt: new Date().toISOString() }
    
    // Appel de la méthode editPalette
    wrapper.vm.editPalette(palette)
    await wrapper.vm.$nextTick()
    
    // Vérifier que editingPalette est une copie de palette
    expect(wrapper.vm.editingPalette).toEqual({ ...palette, colors: ['#FFFFFF', '#000000'] })
    // Vérifier que le formulaire s'ouvre
    expect(wrapper.vm.showPaletteForm).toBe(true)
  })
  
  // deletePalette en fonction de la confirmation utilisateur 
  // Cas où l'utilisateur confirme la suppression
  it('appelle la méthode deletePalette du store lorsque l\'utilisateur confirme la suppression', async () => {
    // Simuler que l'utilisateur confirme
    window.confirm = vi.fn(() => true)
    
    // On remplace la méthode deletePalette du store par un spy
    paletteStore.deletePalette = vi.fn()
    
    const palette = { id: 'palette1', colors: ['#FFFFFF'], createdBy: 'testUser', createdAt: new Date().toISOString() }
    await wrapper.vm.deletePalette(palette)
    
    // Vérifie que la confirmation a été appelée
    expect(window.confirm).toHaveBeenCalledWith("Voulez-vous vraiment supprimer cette palette ?")
    // Vérifie que la méthode deletePalette du store a été appelée avec l'ID de la palette
    expect(paletteStore.deletePalette).toHaveBeenCalledWith(palette.id)
  })
  
  // Cas où l'utilisateur annule la suppression
  it('ne fait rien si l\'utilisateur annule la suppression', async () => {
    // Simuler que l'utilisateur annule
    window.confirm = vi.fn(() => false)
    
    // On utilise un spy sur la méthode deletePalette du store
    paletteStore.deletePalette = vi.fn()
    
    const palette = { id: 'palette1', colors: ['#FFFFFF'], createdBy: 'testUser', createdAt: new Date().toISOString() }
    
    await wrapper.vm.deletePalette(palette)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(paletteStore.deletePalette).not.toHaveBeenCalled()
  })
  
  // watcher sur selectedPalette : vérifie que lorsque selectedPalette change, editingPalette est mis à jour avec une copie de la palette
  it('met à jour editableColors lorsque selectedPalette change', async () => {
    const palette = { id: 'palette1', colors: ['#FFFFFF', '#000000'], createdBy: 'testUser', createdAt: new Date().toISOString() }
    
    wrapper.vm.selectedPalette = palette
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.editableColors).toEqual(['#FFFFFF', '#000000'])
  })

  // watcher sur editableColors : doit corriger automatiquement une couleur qui ne commence pas par "#"
  it('ajoute "#" au début des couleurs dans editableColors si nécessaire', async () => {
    // Affecter une couleur incorrecte sans "#"
    wrapper.vm.editableColors = ['FFFFFF', '#000000']
    await wrapper.vm.$nextTick()
    
    // Le watcher devrait corriger le premier élément
    expect(wrapper.vm.editableColors).toEqual(['#FFFFFF', '#000000'])
  })
  
  // Vérifier que l'ordre des couleurs est mis à jour suite au drag & drop
  it('met à jour l\'ordre des couleurs suite au drag & drop', async () => {
    // On crée une palette initiale avec un ordre de couleurs défini
    const initialPalette = { 
      id: 'palette1', 
      colors: ['#111111', '#222222', '#333333'], 
      createdBy: 'testUser', 
      createdAt: new Date().toISOString() 
    };

    // On affecte cette palette comme palette sélectionnée (l'overlay est affiché)
    wrapper.vm.selectedPalette = initialPalette;
    await wrapper.vm.$nextTick();

    // Vérification que le tableau editableColors est bien initialisé avec les couleurs de la palette
    expect(wrapper.vm.editableColors).toEqual(initialPalette.colors);

    // Simuler le drag & drop en modifiant l'ordre des couleurs
    // Par exemple, on échange la première et la deuxième couleur
    wrapper.vm.editableColors = ['#222222', '#111111', '#333333'];
    await wrapper.vm.$nextTick();

    // On remplace la méthode updatePalette du store par un spy pour vérifier son appel
    paletteStore.updatePalette = vi.fn(() => Promise.resolve());

    // Trouver le composant draggable et déclencher l'événement "end"
    const draggableComp = wrapper.findComponent({ name: 'draggable' });
    await draggableComp.vm.$emit('end');
    await wrapper.vm.$nextTick();

    // Vérifier que la méthode updatePalette a été appelée avec la palette mise à jour
    expect(paletteStore.updatePalette).toHaveBeenCalledWith({
      ...initialPalette,
      colors: ['#222222', '#111111', '#333333']
    });

    // Vérifier que selectedPalette a été mis à jour avec le nouvel ordre de couleurs
    expect(wrapper.vm.selectedPalette.colors).toEqual(['#222222', '#111111', '#333333']);
  });

})
