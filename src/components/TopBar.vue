<template>
  <header class="topbar">
    <div class="topbar__inner">
      <a class="brand" href="/index.html">
        <span>HTR&#8209;<b>United</b></span>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.7-.3 2.5-.3.8 0 1.7.1 2.5.3 1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.5 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 3.9-1.4 6.8-5.2 6.8-9.7C22 6.6 17.5 2 12 2z"/>
        </svg>
      </a>

      <nav class="nav" aria-label="Main navigation">
        <a :href="path('catalog.html')" :class="{ active: isActive('catalog') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          {{ $t('nav.catalog') }}
        </a>
        <a :href="path('document-your-data.html')" :class="{ active: isActive('form') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
          {{ $t('nav.form') }}
        </a>
        <a :href="path('tools.html')" :class="{ active: isActive('tools') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 1 5 5l-9 9-5 1 1-5z"/></svg>
          {{ $t('nav.tools') }}
        </a>
        <a :href="path('actions.html')" :class="{ active: isActive('actions') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          {{ $t('nav.actions') }}
        </a>
        <a :href="path('zenodo.html')" :class="{ active: isActive('zenodo') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {{ $t('nav.zenodo') }}
        </a>
        <a :href="path('team.html')" :class="{ active: isActive('team') }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {{ $t('nav.team') }}
        </a>
      </nav>

      <select class="lang-toggle" :aria-label="$t('nav.home')" :value="locale" @change="setLocale($event.target.value)">
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps({
  activePage: { type: String, default: '' }
})

function isActive(page) {
  if (props.activePage) return props.activePage === page
  const p = window.location.pathname
  if (page === 'catalog') return p.includes('catalog')
  if (page === 'form') return p.includes('document-your-data')
  if (page === 'tools') return p.includes('tools')
  if (page === 'actions') return p.includes('actions')
  if (page === 'zenodo') return p.includes('zenodo')
  if (page === 'team') return p.includes('team')
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
