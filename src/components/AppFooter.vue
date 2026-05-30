<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div>
        <h5>HTR-United</h5>
        <ul>
          <li><a href="/data-reuse-charter.html">{{ $t('nav.charter') }}</a></li>
          <li><a href="/changelog.html">{{ $t('footer.changelog') }}</a></li>
        </ul>
      </div>
      <div>
        <h5>{{ $t('footer.about') }}</h5>
        <ul>
          <li><a href="/team.html">{{ $t('footer.team') }}</a></li>
          <li><a href="https://github.com/HTR-United" target="_blank" rel="noopener">GitHub</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__inner" style="padding-top:16px; border-top:1px solid var(--line);">
      <p class="site-footer__copy">{{ $t('footer.copy') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
