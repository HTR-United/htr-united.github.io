<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="home" />

    <main style="flex:1">
      <div class="hero">
        <img src="/images/logo_htr-united.png" class="hero__logo" alt="HTR-United logo">
        <h1>HTR&#8209;<span class="accent">United</span></h1>
        <p>{{ $t('home.heroDesc') }}</p>
        <div class="hero__ctas">
          <a class="btn btn--olive btn--lg" href="/catalog.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            {{ $t('home.btnCatalog') }}
          </a>
          <a class="btn btn--ghost btn--lg" href="/document-your-data.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            {{ $t('home.btnGenerate') }}
          </a>
        </div>
      </div>

      <div class="section-grid">
        <div class="info-card">
          <h2><span class="icon">⟳</span> {{ $t('home.titleUse') }}</h2>
          <p>
            {{ $t('home.use1') }}
          </p>
          <p>
            {{ $t('home.use2') }}
            <a href="/catalog.html">{{ $t('home.browseLink') }}</a>
            · <a href="https://raw.githubusercontent.com/HTR-United/htr-united/master/htr-united.yml" target="_blank" rel="noopener">YAML</a>
            · <a href="https://raw.githubusercontent.com/HTR-United/htr-united/master/catalog.json" target="_blank" rel="noopener">JSON</a>
          </p>
        </div>

        <div class="info-card">
          <h2><span class="icon">＋</span> {{ $t('home.titleContribute') }}</h2>
          <p>
            {{ $t('home.contrib1') }}
            <a href="/document-your-data.html">{{ $t('nav.form') }}</a>.
          </p>
          <p>
            {{ $t('home.contrib2') }}
            <a href="/tools.html">{{ $t('nav.tools') }}</a>.
          </p>
        </div>

        <div class="info-card">
          <h2><span class="icon">?</span> {{ $t('home.titleModels') }}</h2>
          <p>{{ $t('home.models1') }}</p>
          <p>
            {{ $t('home.models2') }}
            <a href="https://zenodo.org/communities/ocr_models/" target="_blank" rel="noopener">Zenodo</a>.
          </p>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'
const { t } = useI18n()
</script>
