<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar />

    <div class="pagehead">
      <h1>{{ $t('changelog.title') }}</h1>
    </div>

    <div class="page-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        {{ $t('changelog.loading') }}
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

onMounted(async () => {
  try {
    const res = await fetch('https://raw.githubusercontent.com/HTR-United/schema/main/CHANGES.md')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    // Use marked if available, otherwise show raw
    if (typeof window.marked !== 'undefined') {
      html.value = window.marked.parse(text)
    } else {
      // Basic markdown: convert ## headings and wrap in pre
      html.value = '<pre style="white-space:pre-wrap;font-size:14px;line-height:1.7">' + esc(text) + '</pre>'
    }
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
