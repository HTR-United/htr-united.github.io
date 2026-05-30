import { createApp } from 'vue'
import { i18n } from '../i18n.js'
import CatalogApp from '../components/catalog/CatalogApp.vue'

createApp(CatalogApp).use(i18n).mount('#app')
