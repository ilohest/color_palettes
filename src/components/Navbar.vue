<template>
  <nav class="navbar">
    <div class="navbar-center">
      <h1>Palette saver</h1>
    </div>

    <div class="navbar-right">
      <Button 
        v-if="!user" 
        label="Se connecter" 
        icon="pi pi-sign-in" 
        class="p-button-rounded p-button-outlined" 
        @click="login" 
      />
      <div v-else class="user-info">
        <span class="p-mr-2"><i class="pi pi-user"></i> {{ user.displayName }}</span>
        <Button 
          icon="pi pi-sign-out" 
          class="p-button-rounded p-button-danger" 
          @click="logout" 
        />
      </div>
    </div>
  </nav>
</template>

<script>
import Button from "primevue/button";
import { useAuthStore } from "@/stores/useAuthStore.js";
import { computed, ref, onMounted } from "vue";

export default {
  components: { Button },
  setup() {
    const authStore = useAuthStore();
    const user = computed(() => authStore.user); // Rendre `user` réactif depuis Pinia

    // ✅ Connexion avec Google
    const login = async () => {
      await authStore.signInWithGoogle();
    };

    // ✅ Déconnexion
    const logout = async () => {
      await authStore.logout();
    };

    // ✅ Vérification de l'état de l'utilisateur au montage du composant
    onMounted(() => {
      authStore.listenForAuthChanges();
    });

    return { user, login, logout };
  },
};
</script>

<style scoped>
  nav {
    gap: 1rem;
    padding: 1rem;
  }
  .user-info {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 12px;
    width: 100%;
  }
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f8f9fa;
    padding: 0.5rem 1rem;
  }
  .navbar-center {
    flex: 1;
    text-align: center;
  }
  .navbar-center h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .navbar-right i {
    font-size: 1.2rem;
    cursor: pointer;
  }
  .navbar-right span {
    font-size: 1rem;
  }
</style>