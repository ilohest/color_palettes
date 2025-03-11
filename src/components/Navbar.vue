// Gère la navigation de l'application
//-----------------------------------------------------------------

<template>
  <nav class="navbar">
    <!-- Groupe central : titre -->
    <div class="navbar-center">
      <h1>koolors</h1>
    </div>

    <!-- Groupe droit : boutons d'authentification -->
    <div class="navbar-right">
      <div v-if="!user" class="navbar-right">
        <Button 
          label="Login" 
          icon="pi pi-sign-in" 
          class="p-button-rounded p-button-outlined" 
          @click="openLoginModal" 
        />
        <Button 
          label="Sign Up" 
          icon="pi pi-user-plus" 
          class="p-button-rounded p-button-outlined" 
          @click="openSignupModal" 
        />
      </div>
      <div v-else class="user-info">
        <Button 
          class="p-button-rounded p-button-outlined" 
          @click="openUserForm"
        >
          <i class="pi pi-user"></i>
          {{ user.displayName || user.email }}
        </Button>
        <Button 
          icon="pi pi-sign-out" 
          class="p-button-rounded p-button-outlined" 
          @click="logout" 
        />
      </div>
    </div>

    <!-- Toast pour la confirmation -->
    <Toast />

    <!-- Modal Login -->
    <Dialog v-model:visible="showLogin" modal dismissableMask>
      <template #header>
        <h3>Login</h3>
      </template>
      <!-- Affichage du spinner pendant le chargement -->
      <div v-if="isLoggingIn" class="saving-overlay">
        <ProgressSpinner />
      </div>
      <div class="auth-modal">
        <template v-if="!loginEmailMode">
          <Button 
            label="Login with Google" 
            icon="pi pi-google" 
            class="p-button-rounded p-mb-3" 
            @click="loginWithGoogle" 
          />
          <Button 
            label="Login with Email" 
            icon="pi pi-envelope" 
            class="p-button-rounded p-mb-3" 
            @click="enterLoginEmailMode" 
          />
          <p>
            Don't have an account? 
            <a href="#" @click.prevent="switchToSignup">Sign Up</a>
          </p>
        </template>
        <template v-else> 
          <div class="email-login">
            <!-- Formulaire de login avec email -->
            <div class="p-field">
              <InputText v-model="loginEmail" placeholder="Email" />
            </div>
            <div class="p-field">
              <Password v-model="loginPassword" placeholder="Password" :feedback="false"/>
            </div>
            <Button 
              label="Login" 
              icon="pi pi-check" 
              class="p-button-rounded" 
              @click="loginWithEmail" 
            />
            <p>
              Don't have an account? 
              <a href="#" @click.prevent="switchToSignup">Sign Up</a>
            </p>
            <p>
              <a href="#" @click.prevent="exitLoginEmailMode">Back</a>
            </p>
          </div>
        </template>
      </div>
    </Dialog>

    <!-- Modal Sign Up -->
    <Dialog v-model:visible="showSignup" modal dismissableMask>
      <template #header>
        <h3>Sign Up</h3>
      </template>
      <div class="auth-modal">
        <template v-if="!signupEmailMode">
          <Button 
            label="Sign Up with Google" 
            icon="pi pi-google" 
            class="p-button-rounded p-mb-3" 
            @click="signupWithGoogle" 
          />
          <Button 
            label="Sign Up with Email" 
            icon="pi pi-envelope" 
            class="p-button-rounded p-mb-3" 
            @click="enterSignupEmailMode" 
          />
          <p>
            Already have an account? 
            <a href="#" @click.prevent="switchToLogin">Login</a>
          </p>
        </template>
        <template v-else>
          <!-- Formulaire d'inscription avec email via UserForm -->
          <!-- En mode inscription, on passe user à null -->
          <UserForm
            v-if="signupEmailMode"
            v-model:visible="signupEmailMode"
            :user="null"
            :isSaving="isSaving"
            @save="handleUserSave"
            @close="exitSignupEmailMode"
          />
          <p>
            Already have an account? 
            <a href="#" @click.prevent="switchToLogin">Login</a>
          </p>
          <p>
            <a href="#" @click.prevent="exitSignupEmailMode">Back</a>
          </p>
        </template>
      </div>
    </Dialog>

    <!-- Modal UserForm pour modification du profil -->
    <UserForm
      v-if="showUserForm"
      v-model:visible="showUserForm"
      :user="user"
      :isSaving="isSaving"
      @save="handleUserSave"
      @close="closeUserForm"
    />
  </nav>
</template>

<script>
  import { ref, computed, onMounted } from "vue";
  import Button from "primevue/button";
  import Dialog from "primevue/dialog";
  import InputText from "primevue/inputtext";
  import Password from "primevue/password";
  import UserForm from "@/components/UserForm.vue";
  import { useAuthStore } from "@/stores/useAuthStore.js";
  import ProgressSpinner from "primevue/progressspinner";
  import Toast from "primevue/toast";
  import { useToast } from "primevue/usetoast"; 

  export default {
    name: "Navbar",
    components: { Button, Dialog, InputText, Password, UserForm, Toast, ProgressSpinner },
    setup() {
      const authStore = useAuthStore();
      const showLogin = ref(false);
      const showSignup = ref(false);
      const showUserForm = ref(false);
      const signupEmailMode = ref(false);
      const loginEmailMode = ref(false);
      const userFormKey = ref("signup");
      const toast = useToast();
      const isLoggingIn = ref(false);
      const loginEmail = ref("");
      const loginPassword = ref("");
      const isSaving = ref(false);

      const user = computed(() => authStore.user);

      const openLoginModal = () => {
        showLogin.value = true;
        showSignup.value = false;
        loginEmailMode.value = false;
      };

      const openSignupModal = () => {
        showSignup.value = true;
        showLogin.value = false;
        signupEmailMode.value = false;
      };

      const switchToSignup = () => {
        showSignup.value = true;
        showLogin.value = false;
        signupEmailMode.value = false;
      };

      const switchToLogin = () => {
        showLogin.value = true;
        showSignup.value = false;
        loginEmailMode.value = false;
      };

      const enterSignupEmailMode = () => {
        signupEmailMode.value = true;
      };

      const exitSignupEmailMode = () => {
        signupEmailMode.value = false;
        // Fermer le modal Signup si besoin
        showSignup.value = false;
      };

      const enterLoginEmailMode = () => {
        loginEmailMode.value = true;
      };

      const exitLoginEmailMode = () => {
        loginEmailMode.value = false;
      };

      const closeLoginModal = () => {
        showLogin.value = false;
        loginEmailMode.value = false;
      };

      const closeSignupModal = () => {
        showSignup.value = false;
        signupEmailMode.value = false;
      };

      const loginWithGoogle = async () => {
        await authStore.signInWithGoogle();
        closeLoginModal();
      };

      const signupWithGoogle = async () => {
        await authStore.signInWithGoogle();
        closeSignupModal();
      };

      // Login avec email/mot de passe
      const loginWithEmail = async () => {
        isLoggingIn.value = true;
        try {
          await authStore.loginWithEmail(loginEmail.value, loginPassword.value);
          // Fermer le modal de login si nécessaire
          closeLoginModal();
        } catch (error) {
          console.error("Login with email failed:", error);
          toast.add({
            severity: "error",
            summary: "Login failed",
            detail: "Invalid email or password.",
            life: 3000,
          });
        } finally {
          isLoggingIn.value = false;
        }
      };

      // Inscription avec email/mot de passe via UserForm
      const handleUserSave = async (updatedUser) => {
        try {
          if (signupEmailMode.value) {
            isSaving.value = true; // active le spinner
            await authStore.signupWithEmail(
              updatedUser.email,
              updatedUser.password,
              {
                fullName: updatedUser.fullName,
                birthdate: updatedUser.birthdate,
                username: updatedUser.username,
              }
            );
            isSaving.value = false;
            exitSignupEmailMode();
            toast.add({
              severity: "success",
              summary: "Registration successful",
              detail: "Your account has been created successfully.",
              life: 3000,
            });
          } else {
            isSaving.value = true;
            await authStore.updateUserProfile(updatedUser);
            isSaving.value = false;
            closeUserForm();
            toast.add({
              severity: 'success',
              summary: 'Profile updated',
              detail: 'Your profile has been updated successfully.',
              life: 3000,
            });
          }
        } catch (error) {
          isSaving.value = false;
          console.error("Error saving user:", error);
          if (error.code === "auth/email-already-in-use") {
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: "This email address is already used for another account. Please, try again with another email adress.",
              life: 5000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: "An error has occurred.",
              life: 3000,
            });
          }
        }
      };

      const logout = async () => {
        await authStore.logout();
      };

      const openUserForm = () => {
        // Si l'utilisateur est connecté, utilise son uid pour forcer la recréation du composant
        userFormKey.value = user.value ? user.value.uid : "signup";
        showUserForm.value = true;
      };

      const closeUserForm = () => {
        showUserForm.value = false;
      };

      onMounted(() => {
        authStore.listenForAuthChanges();
      });

      return {
        user,
        showLogin,
        showSignup,
        showUserForm,
        signupEmailMode,
        loginEmailMode,
        loginEmail,
        loginPassword,
        openLoginModal,
        openSignupModal,
        switchToSignup,
        switchToLogin,
        enterSignupEmailMode,
        exitSignupEmailMode,
        enterLoginEmailMode,
        exitLoginEmailMode,
        closeLoginModal,
        closeSignupModal,
        loginWithGoogle,
        signupWithGoogle,
        loginWithEmail,
        logout,
        openUserForm,
        closeUserForm,
        handleUserSave,
        userFormKey,
        logout,
        isSaving,
        loginWithEmail,
        isLoggingIn,
      };
    },
  };
</script>

<style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid #ddd;
  }
  .navbar-center h1 {
    margin: 0;
    font-size: 1.8rem;
    color: rgb(255, 0, 106);
  }
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  a {
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: underline;
  }
  .auth-modal {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .auth-modal p {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
  }
  .spinner-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .email-login {
    position: relative; 
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .saving-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: 12px;
  }

</style>
