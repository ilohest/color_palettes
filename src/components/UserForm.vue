<template>
    <Dialog
      v-model:visible="visible"
      modal
      dismissableMask
    >
      <template #header>
        <div class="dialog-header">
          <h3>{{ isEditing ? "Update Profile" : "Sign Up" }}</h3>
          <!-- Bouton de fermeture en haut à droite -->
        </div>
      </template>
  
      <!-- Overlay spinner s'affiche par-dessus le contenu quand isSaving est true -->
      <div v-if="isSaving" class="saving-overlay">
      <!-- <div class="saving-overlay"> -->
        <ProgressSpinner />
      </div>
  
      <div class="user-form-content">
        <div class="p-field">
          <InputText v-model="localUser.fullName" placeholder="Full Name" />
        </div>
        <div class="p-field">
          <InputText v-model="localUser.birthdate" placeholder="YYYY-MM-DD" />
        </div>
        <div class="p-field">
          <InputText v-model="localUser.username" placeholder="User Name" />
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
          <Button label="Save" icon="pi pi-check" @click="submitForm" />
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
  import { useToast } from "primevue/usetoast";
  
  export default {
    name: "UserForm",
    components: { Button, InputText, Password, ProgressSpinner, Dialog },
    props: {
      user: {
        type: Object,
        default: null,
      },
      isSaving: {
        type: Boolean,
        default: false,
      },
      modelValue: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["save", "close", "update:modelValue"],
    setup(props, { emit }) {
        const visible = ref(props.modelValue);
        const toast = useToast();
        const isEditing = computed(() => !!props.user);
        const confirmPassword = ref("");


        const localUser = ref({
            fullName: "",
            birthdate: "",
            username: "",
            email: "",
            password: "",
        });

        const resetLocalUser = () => {
            localUser.value = {
                fullName: props.user ? props.user.fullName : "",
                birthdate: props.user ? props.user.birthdate : "",
                username: props.user ? props.user.username : "",
                email: props.user ? props.user.email : "",
                password: "",
            };
            confirmPassword.value = "";
        };
        
        const submitForm = () => {
            if (!isEditing.value && localUser.value.password !== confirmPassword.value) {
                // Au lieu de alert, affichez un toast d'erreur
                toast.add({
                    severity: "error",
                    summary: "Erreur",
                    detail: "Les mots de passe ne correspondent pas !",
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

        watch(
            () => props.modelValue,
            (newVal) => {
                visible.value = newVal;
            }
        );

        watch(visible, (newVal) => {
            emit("update:modelValue", newVal);
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
  