import { createApp } from 'vue'
import { i18n } from '../i18n.js'
import App from '../components/pages/ActionsPage.vue'
createApp(App).use(i18n).mount('#app')
