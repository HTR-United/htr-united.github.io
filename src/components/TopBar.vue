<template>
  <header class="topbar" :class="{ 'menu-open': menuOpen }">
    <div class="topbar__inner">
      <a class="brand" href="/index.html">
        <span>HTR&#8209;<b>United</b></span>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.7-.3 2.5-.3.8 0 1.7.1 2.5.3 1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.5 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 3.9-1.4 6.8-5.2 6.8-9.7C22 6.6 17.5 2 12 2z"/>
        </svg>
      </a>

      <nav class="nav" :class="{ 'nav--open': menuOpen }" aria-label="Main navigation">
        <a :href="path('index.html')" :class="{ active: isActive('home') }" @click="menuOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          {{ $t('nav.home') }}
        </a>
        <a :href="path('catalog.html')" :class="{ active: isActive('catalog') }" @click="menuOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          {{ $t('nav.browse') }}
        </a>
        <a :href="path('zenodo.html')" :class="{ active: isActive('zenodo') }" @click="menuOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {{ $t('nav.share') }}
        </a>
        <a :href="path('document-your-data.html')" :class="{ active: isActive('form') }" @click="menuOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          {{ $t('nav.record') }}
        </a>
        <a :href="path('tools.html')" :class="{ active: isActive('tools') }" @click="menuOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 1 5 5l-9 9-5 1 1-5z"/></svg>
          {{ $t('nav.tools') }}
        </a>
      </nav>

      <select class="lang-toggle" :aria-label="$t('nav.home')" :value="locale" @change="setLocale($event.target.value)">
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>

      <button class="menu-btn" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <svg v-if="!menuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const menuOpen = ref(false)

const props = defineProps({
  activePage: { type: String, default: '' }
})

function isActive(page) {
  if (props.activePage) return props.activePage === page
  const p = window.location.pathname
  if (page === 'home') return p === '/' || p.endsWith('index.html')
  if (page === 'catalog') return p.includes('catalog')
  if (page === 'form') return p.includes('document-your-data')
  if (page === 'tools') return p.includes('tools')
  if (page === 'zenodo') return p.includes('zenodo')
  return false
}

function path(file) {
  // Works both in dev (root served from src/) and in prod (dist/)
  return '/' + file
}

function setLocale(lang) {
  locale.value = lang
  localStorage.setItem('htr-lang', lang)
}
</script>
