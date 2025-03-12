// Le composant reçoit une prop user qui contient les données de l'utilisateur
// Si user est présent, le formulaire est en mode édition (update) et les champs sont pré-remplis avec les valeurs existantes
// Si user est nul, le formulaire est en mode inscription (signup) et les champs commencent vides.

<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
  >
    <template #header>
      <div class="dialog-header">
        <h3>{{ isEditing ? "Update Profile" : "Sign Up" }}</h3>
      </div>
    </template>

    <div v-if="isSaving" class="saving-overlay">
      <ProgressSpinner />
    </div>

    <div class="user-form-content">
      <div class="p-field">
        <InputText v-model="localUser.fullName" placeholder="Full name" />
      </div>
      <div class="p-field">
        <InputText v-model="localUser.username" placeholder="User name" />
      </div>
      <div class="p-field">
        <DatePicker 
          v-model="localUser.dateOfBirth" 
          dateFormat="yy-mm-dd" 
          showIcon 
          placeholder="Date of birth" 
        />
      </div>
      <!-- En mode inscription, l'email est modifiable -->
      <div class="p-field" v-if="!isEditing">
        <InputText v-model="localUser.email" placeholder="Email" />
      </div>
      <!-- En mode modification, afficher l'email en lecture seule -->
      <div class="p-field" v-else>
        <p>{{ localUser.email }}</p>
      </div>
      <!-- Affichage des champs de mot de passe uniquement en mode inscription -->
      <div class="p-field" v-if="!isEditing">
        <Password v-model="localUser.password" placeholder="Password" :feedback="false" />
      </div>
      <div class="p-field" v-if="!isEditing">
        <Password v-model="confirmPassword" placeholder="Confirm Password" :feedback="false" />
      </div>
    </div>

    <template #footer>
      <div class="user-form-footer">
        <Button label="Save" icon="pi pi-check" @click="submitForm"/>
        <Button label="Cancel" icon="pi pi-times" class="p-button-secondary" @click="closeForm" />
      </div>
    </template>
  </Dialog>
</template>
  
<script>
  import { ref, computed, watch } from "vue";
  import Button from "primevue/button";
  import InputText from "primevue/inputtext";
  import Password from "primevue/password";
  import ProgressSpinner from "primevue/progressspinner";
  import Dialog from "primevue/dialog";
  import DatePicker from "primevue/datepicker";
  import { useToast } from "primevue/usetoast";

  export default {
    name: "UserForm",
    components: { Button, InputText, Password, ProgressSpinner, Dialog, DatePicker },
    props: {
      user: {
        type: Object,
        default: null,
      },
      isSaving: {
        type: Boolean,
        default: false,
      },
      visible: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["save", "close", "update:visible"],
    setup(props, { emit }) {
      const visible = ref(props.visible);
      const toast = useToast();
      const isEditing = computed(() => !!props.user); // Cette propriété calculée permet de savoir si le formulaire doit fonctionner en mode modification ou inscription.
      const confirmPassword = ref("");

      const localUser = ref({ // Le formulaire utilise un objet réactif localUser qui sert de "copie locale" des données utilisateur pour lier les champs du formulaire.
        fullName: "",
        dateOfBirth: null,
        username: "",
        email: "",
        password: "",
      });

      // Fonction pour réinitialiser les valeurs locales: met à jour localUser en fonction de la prop user
      // En mode édition, les champs sont initialisés avec les valeurs de l'objet user
      // En mode inscription, les champs sont vides
      const resetLocalUser = () => {
        localUser.value = {
          fullName: props.user ? props.user.fullName : "",
          dateOfBirth:
            props.user && props.user.dateOfBirth && !isNaN(Date.parse(props.user.dateOfBirth))
              ? new Date(props.user.dateOfBirth)
              : null,
          username: props.user ? props.user.username : "",
          email: props.user ? props.user.email : "",
          password: "",
        };
        confirmPassword.value = "";
      };
      
      // En mode inscription, elle vérifie que le mot de passe est renseigné et correspond à la confirmation du mdp
      // Elle prépare un objet dataToSave à partir de localUser. En mode édition, si le mot de passe est vide, il est retiré de l'objet pour éviter de forcer une modification du mot de passe.
      // Emet un événement "save" pour que le parent (Navbar.vue) puisse traiter la sauvegarde.
      const submitForm = () => {
        if (!isEditing.value && localUser.value.password !== confirmPassword.value) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Passwords do not match. Please try again.",
            life: 3000,
          });
          return;
        }

        const dataToSave = { ...localUser.value };
        if (isEditing.value && !dataToSave.password) {
          delete dataToSave.password;
        }

        emit("save", dataToSave);
      };
      
      const closeForm = () => {
        visible.value = false;
      };

      watch( // met à jour la variable locale visible au chargement et lors de toute modification externe 
        () => props.visible,
        (newVal) => {
          visible.value = newVal;
        }
      );

      watch(visible, (newVal) => { // se déclenche dès que visible.value change : émet l'événement "update:visible" avec la nouvelle valeur et, si la valeur est false, émet aussi "close".
        emit("update:visible", newVal);
        if (!newVal) {
          emit("close");
        }
      });

      watch(
        () => props.user,
        () => {
          resetLocalUser();
        },
        { immediate: true }
      );

      return {
        visible,
        isEditing,
        localUser,
        confirmPassword,
        submitForm,
        closeForm,
      };
    },
  };
</script>
  
<style scoped>
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    z-index: 1200;
    border-radius: 12px;
  } 
  .user-form-header {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }
  .user-form-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .user-form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }
  .close-btn {
    cursor: pointer;
  }
</style>
  