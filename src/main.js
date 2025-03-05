import { createApp } from 'vue';
import { createPinia } from "pinia"; // ✅ Import de Pinia
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'; // ✅ Thème Aura
import router from './router'; // 🚀 Import du router
import { useAuthStore } from "@/stores/useAuthStore.js";
import "primeicons/primeicons.css";
import '@fortawesome/fontawesome-free/css/all.css';


const app = createApp(App);
const pinia = createPinia(); // ✅ Création de l'instance Pinia

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

const authStore = useAuthStore();
authStore.listenForAuthChanges(); // ✅ Vérifie si un utilisateur est déjà connecté

app.mount('#app');
