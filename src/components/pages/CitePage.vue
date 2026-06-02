<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar />

    <div class="pagehead">
      <h1>{{ $t('cite.title') }}</h1>
      <p>{{ $t('cite.intro') }}</p>
    </div>

    <div class="page-content" style="max-width:860px">

      <div class="form-section">
        <h2>{{ $t('cite.bibtexTitle') }}</h2>
        <pre class="cite-block">{{ bibtex }}</pre>
        <button class="btn btn--ghost" style="margin-top:10px" @click="copy('bibtex')">
          {{ copied.bibtex ? $t('cite.copied') : $t('cite.copy') }}
        </button>
      </div>

      <div class="form-section">
        <h2>{{ $t('cite.apaTitle') }}</h2>
        <p class="cite-apa">{{ apa }}</p>
        <button class="btn btn--ghost" style="margin-top:10px" @click="copy('apa')">
          {{ copied.apa ? $t('cite.copied') : $t('cite.copy') }}
        </button>
      </div>

      <div class="form-section">
        <h2>{{ $t('cite.datasetTitle') }}</h2>
        <p>{{ $t('cite.datasetDesc') }}</p>
        <a class="btn btn--primary" href="/catalog.html">{{ $t('nav.browse') }}</a>
      </div>

    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'

const { t } = useI18n()

const bibtex = `@misc{htrunited,
  author       = {Chagué, Alix and Clérice, Thibault},
  title        = {{HTR-United}: A Centralized Registry of Ground Truth
                  Datasets for Handwritten Text Recognition},
  year         = {2021},
  howpublished = {\\url{https://htr-united.github.io}},
  note         = {GitHub organization: \\url{https://github.com/HTR-United}}
}`

const apa = `Chagué, A., & Clérice, T. (2021). HTR-United: A Centralized Registry of Ground Truth Datasets for Handwritten Text Recognition. https://htr-united.github.io`

const copied = reactive({ bibtex: false, apa: false })

async function copy(key) {
  const text = key === 'bibtex' ? bibtex : apa
  await navigator.clipboard.writeText(text)
  copied[key] = true
  setTimeout(() => { copied[key] = false }, 2000)
}
</script>

<style scoped>
.cite-block {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink-2);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
.cite-apa {
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--ink-2);
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  margin: 0;
}
</style>
