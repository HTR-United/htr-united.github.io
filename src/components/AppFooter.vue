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
      <div class="site-footer__eu">
        <img
          src="https://transcriboquest24.sciencesconf.org/data/pages/EN_FundedbytheEU_RGB_POS.png"
          alt="Funded by the European Union"
          class="site-footer__eu-logo"
        >
        <p class="site-footer__eu-text">
          Funded by the European Union under Grant Agreement n.&nbsp;101132163.
          Views and opinions expressed are however those of the author(s) only
          and do not necessarily reflect those of the European Union.
          Neither the European Union nor the granting authority can be held
          responsible for them.
        </p>
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

<style scoped>
.site-footer__eu {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 480px;
}
.site-footer__eu-logo {
  width: 120px;
  flex-shrink: 0;
  object-fit: contain;
}
.site-footer__eu-text {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--ink-3);
  margin: 0;
}
</style>
