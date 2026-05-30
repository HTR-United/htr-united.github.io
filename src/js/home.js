import { createApp } from 'vue'
import { i18n } from '../i18n.js'
import App from '../components/pages/HomePage.vue'
createApp(App).use(i18n).mount('#app')
