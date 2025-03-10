// Point d'entrée de l'application. C'est ici que l'on importe les dépendances nécessaires et que l'on configure l'application. 
//----------------------------------------------------------------

// Import des dépendances
import { createApp } from 'vue';
import { createPinia,setActivePinia } from "pinia"; // ✅ Import de Pinia
import App from './App.vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura'; // ✅ Thème Aura
import router from './router'; // 🚀 Import du router
import { useAuthStore } from "@/stores/useAuthStore.js";
import "primeicons/primeicons.css";
import '@fortawesome/fontawesome-free/css/all.css';

// Importer les composants nécessaires
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ToggleSwitch from "primevue/toggleswitch";
import ColorPicker from 'primevue/colorpicker';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Tooltip from "primevue/tooltip";

// Création de l'application
const app = createApp(App);
const pinia = createPinia();
setActivePinia(pinia);
const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{pink.50}',
            100: '{pink.100}',
            200: '{pink.200}',
            300: '{pink.300}',
            400: '{pink.400}',
            500: '{pink.500}',
            600: '{pink.600}',
            700: '{pink.700}',
            800: '{pink.800}',
            900: '{pink.900}',
            950: '{pink.950}'
        }
    }
});

// Configuration de l'application
app.use(PrimeVue, {
    theme: {
        preset: MyPreset, // Définition du thème utilisé
        options: {
            prefix: 'p',
            darkModeSelector: 'system', // Mode sombre activé selon les préférences système
            cssLayer: false // Désactive les CSS Layers (optionnel)
        }
    }
});
app.use(pinia); // ✅ Activation de Pinia
app.use(router); // 🚀 Ajout du routeur
app.use(ToastService);

// Enregistrer globalement les composants
app.component('Button', Button);
app.component('InputText', InputText);
app.component('ToggleSwitch', ToggleSwitch);
app.component('ColorPicker', ColorPicker);
app.component('Toast', Toast);
app.directive("tooltip", Tooltip);

// Vérifier si un utilisateur est déjà connecté
const authStore = useAuthStore();
authStore.listenForAuthChanges(); 

// Monter l'application dans le DOM via le point d'entrée dans le fichier index.html
app.mount('#app');
