<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar />
    <div class="pagehead">
      <h1>{{ $t('nav.catalog') }}</h1>
    </div>
    <div class="page-content">
      <div v-if="dataset" class="card" style="max-width:800px">
        <div class="card__band">
          <div class="card__title">{{ dataset.name }}</div>
          <div class="card__era">{{ dataset.era }}</div>
        </div>
        <div class="card__body">
          <div class="chips">
            <span v-for="lang in dataset.language" :key="lang" class="chip chip--rose">
              <span class="chip__k">Lang</span><span class="chip__v">{{ lang }}</span>
            </span>
          </div>
          <p class="card__desc">{{ dataset.description }}</p>
          <div class="card__authors" v-if="dataset.authors"><b>Authors</b> · {{ dataset.authors }}</div>
          <div class="card__foot">
            <a v-if="dataset.repo" class="btn btn--primary" :href="dataset.repo" target="_blank" rel="noopener">View repository</a>
            <a class="btn btn--ghost" href="/catalog.html">← Back to catalog</a>
          </div>
        </div>
      </div>
      <div v-else>
        <p><a href="/catalog.html">← Back to catalog</a></p>
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
import { useCatalog } from '../../composables/useCatalog.js'

const { t } = useI18n()
const { datasets, loading } = useCatalog()
const dataset = ref(null)

onMounted(() => {
  const id = new URLSearchParams(window.location.search).get('id')
  if (id) {
    const check = () => {
      const found = datasets.value.find(d => d.id === id)
      if (found) { dataset.value = found; return }
      if (!loading.value) return
      setTimeout(check, 100)
    }
    check()
  }
})
</script>
