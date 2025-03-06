// Point d'entrée de l'application. C'est ici que l'on importe les dépendances nécessaires et que l'on configure l'application. 
//----------------------------------------------------------------

// Import des dépendances
import { createApp } from 'vue';
import { createPinia } from "pinia"; // ✅ Import de Pinia
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'; // ✅ Thème Aura
import router from './router'; // 🚀 Import du router
import { useAuthStore } from "@/stores/useAuthStore.js";
import "primeicons/primeicons.css";
import '@fortawesome/fontawesome-free/css/all.css';

// Importer les composants nécessaires
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputSwitch from 'primevue/inputswitch';
import ColorPicker from 'primevue/colorpicker';

// Création de l'application
const app = createApp(App);
const pinia = createPinia(); // ✅ Création de l'instance Pinia

// Configuration de l'application
app.use(PrimeVue, {
    theme: {
        preset: Aura, // Définition du thème utilisé
        options: {
            darkModeSelector: 'system', // Mode sombre activé selon les préférences système
            cssLayer: false // Désactive les CSS Layers (optionnel)
        }
    }
});
app.use(pinia); // ✅ Activation de Pinia
app.use(router); // 🚀 Ajout du routeur

// Enregistrer globalement les composants
app.component('Button', Button);
app.component('InputText', InputText);
app.component('InputSwitch', InputSwitch);
app.component('ColorPicker', ColorPicker);

// Vérifier si un utilisateur est déjà connecté
const authStore = useAuthStore();
authStore.listenForAuthChanges(); 

// Monter l'application dans le DOM via le point d'entrée dans le fichier index.html
app.mount('#app');
