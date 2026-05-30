<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar />

    <div class="pagehead">
      <h1>{{ $t('charter.title') }}</h1>
    </div>

    <div class="page-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        {{ $t('charter.loading') }}
      </div>
      <div v-else-if="error" style="color:var(--rose-ink)">{{ error }}</div>
      <div v-else class="prose" v-html="html"></div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'

const { t } = useI18n()
const loading = ref(true)
const error   = ref(null)
const html    = ref('')

const CHARTER_URL = 'https://raw.githubusercontent.com/HTR-United/htr-united/master/data-reuse-charter.md'

onMounted(async () => {
  try {
    const res = await fetch(CHARTER_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    html.value = '<pre style="white-space:pre-wrap;font-size:14px;line-height:1.7">' + esc(text) + '</pre>'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function esc(s) {
  return s.replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]))
}
</script>
