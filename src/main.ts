import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css';
import './index.css';
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Password from 'primevue/password'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
const app = createApp(App)
app.component('PButton', Button)
app.component('PInputText', InputText)
app.component('PDropdown', Dropdown)
app.component('PPassword', Password)
app.component('PToast', Toast)
app.component('PConfirmDialog', ConfirmDialog)
app.directive('tooltip', Tooltip)
app.use(ToastService)
app.use(ConfirmationService)
app.use(createPinia())
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    }
});
app.mount('#app')
