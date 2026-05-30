<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar />

    <div class="pagehead">
      <h1>{{ $t('changelog.title') }}</h1>
      <p>
        Schema releases from
        <a href="https://github.com/HTR-United/schema/releases" target="_blank" rel="noopener">
          HTR-United/schema
        </a>
      </p>
    </div>

    <div class="page-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        {{ $t('changelog.loading') }}
      </div>

      <div v-else-if="error" style="color:var(--rose-ink)">{{ error }}</div>

      <div v-else class="changelog-list">
        <div v-for="release in releases" :key="release.tag_name" class="changelog-entry">
          <div class="changelog-entry__header">
            <span class="changelog-entry__tag">{{ release.tag_name }}</span>
            <span class="changelog-entry__date">{{ formatDate(release.published_at) }}</span>
            <a :href="release.html_url" target="_blank" rel="noopener" class="changelog-entry__link">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.7-.3 2.5-.3.8 0 1.7.1 2.5.3 1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.5 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 3.9-1.4 6.8-5.2 6.8-9.7C22 6.6 17.5 2 12 2z"/></svg>
              GitHub
            </a>
          </div>
          <h2 class="changelog-entry__name">{{ release.name || release.tag_name }}</h2>
          <div v-if="release.body" class="changelog-entry__body prose" v-html="renderBody(release.body)"></div>
          <div v-else class="changelog-entry__body" style="color:var(--ink-3);font-style:italic">No release notes.</div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'
import { renderMarkdown } from '../../utils/markdown.js'

const { t } = useI18n()
const loading  = ref(true)
const error    = ref(null)
const releases = ref([])

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/repos/HTR-United/schema/releases')
    if (!res.ok) throw new Error(`GitHub API: HTTP ${res.status}`)
    releases.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function renderBody(text) {
  return renderMarkdown(text)
}
</script>

<style scoped>
.changelog-list { max-width: 760px; display: flex; flex-direction: column; gap: 0; }

.changelog-entry {
  padding: 28px 0;
  border-bottom: 1px solid var(--line);
}
.changelog-entry:last-child { border-bottom: none; }

.changelog-entry__header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;
}
.changelog-entry__tag {
  font-family: var(--mono); font-size: 13px; font-weight: 700;
  background: var(--olive-tint-2); color: var(--olive-deep);
  border: 1px solid var(--olive-tint); border-radius: 6px; padding: 3px 10px;
}
.changelog-entry__date { font-size: 13px; color: var(--ink-3); }
.changelog-entry__link {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12.5px; font-weight: 600; color: var(--accent);
  margin-left: auto;
}
.changelog-entry__link:hover { text-decoration: underline; }

.changelog-entry__name {
  font-family: var(--serif); font-size: 20px; font-weight: 600;
  color: var(--ink); margin: 0 0 14px; letter-spacing: -.01em;
}

.changelog-entry__body { font-size: 14px; }
</style>
