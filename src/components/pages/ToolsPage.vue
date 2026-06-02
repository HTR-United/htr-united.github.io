<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="tools" />

    <div class="pagehead">
      <h1>{{ $t('tools.title') }}</h1>
      <p>{{ $t('tools.intro') }}</p>
    </div>

    <div class="page-content">
      <div class="tool-card tool-card--featured">
        <div class="tool-card__image">
          <img src="/images/chocomufin.png" alt="ChocoMufin logo">
        </div>
        <div class="tool-card__body">
          <h2>ChocoMufin</h2>
          <p>{{ $t('tools.chocomufin') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--primary" href="https://github.com/PonteIneptique/choco-mufin" target="_blank" rel="noopener">GitHub</a>
            <a class="btn btn--primary" href="/choco-mufin.js">{{ $t('tools.chocomufinWeb') }}</a>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-card__image">
          <img src="/images/humgenerator.png" alt="HUMGenerator logo">
        </div>
        <div class="tool-card__body">
          <h2>HUMGenerator</h2>
          <p>{{ $t('tools.humg') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--primary" href="https://github.com/HTR-United/HTR-United-Metadata-Generator" target="_blank" rel="noopener">GitHub</a>
            <a class="btn btn--ghost" href="/demo/humg.html">{{ $t('tools.seeDemo') }}</a>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-card__image">
          <img src="/images/HTRUC.png" alt="HTRUC logo">
        </div>
        <div class="tool-card__body">
          <h2>HTRUC</h2>
          <p>{{ $t('tools.htruc') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--primary" href="https://github.com/HTR-United/HTRUC" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-card__image">
          <img src="/images/htrvx.png" alt="HTRVX logo">
        </div>
        <div class="tool-card__body">
          <h2>HTRVX</h2>
          <p>{{ $t('tools.htrvx') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--primary" href="https://github.com/HTR-United/HTRVX" target="_blank" rel="noopener">GitHub</a>
            <a class="btn btn--ghost" href="/demo/htrvx.html">{{ $t('tools.seeDemo') }}</a>
          </div>
        </div>
      </div>

      <div class="tool-card tool-card--featured">
        <div class="tool-card__image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"
               style="width:64px;height:64px;color:var(--olive-deep)" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <div class="tool-card__body">
          <h2>{{ $t('nav.actions') }}</h2>
          <p>{{ $t('tools.actionsDesc') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--primary" href="/actions.html">{{ $t('nav.actions') }}</a>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'
const { t } = useI18n()
</script>
