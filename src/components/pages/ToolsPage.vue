<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="tools" />

    <div class="pagehead">
      <h1>{{ $t('tools.title') }}</h1>
      <p>{{ $t('tools.intro') }}</p>
    </div>

    <div class="page-content">
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

      <div class="tool-card">
        <div class="tool-card__image">
          <img src="/images/chocomufin.png" alt="ChocoMufin logo">
        </div>
        <div class="tool-card__body">
          <h2>ChocoMufin</h2>
          <p>{{ $t('tools.chocomufin') }}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--primary" href="https://github.com/PonteIneptique/choco-mufin" target="_blank" rel="noopener">GitHub</a>
            <a class="btn btn--ghost" href="/choco-mufin.js">{{ $t('tools.chocomufinWeb') }}</a>
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
