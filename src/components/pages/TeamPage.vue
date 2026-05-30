<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="team" />

    <div class="pagehead">
      <h1>{{ $t('team.title') }}</h1>
    </div>

    <div class="page-content">
      <div class="team-grid">
        <!-- Alix -->
        <div class="team-card">
          <div class="team-card__photo-row">
            <img
              src="https://alix-tz.github.io/img/profile.png"
              class="team-card__photo"
              alt="Alix Chagué"
              loading="lazy"
            >
            <div>
              <h2>{{ $t('team.alix.name') }}</h2>
              <div class="team-card__role">{{ $t('team.alix.role') }}</div>
              <a class="team-card__orcid" href="https://orcid.org/0000-0002-0136-4434" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.086 3.5h2.172v1.5h-2.172V5.5zm0 3h2.172V18h-2.172V8.5zm-3.086 0h2.172v1.5c.414-.547 1.219-1.664 2.914-1.664 2.664 0 3.914 1.773 3.914 4.57V18h-2.172v-5.094c0-1.734-.672-2.766-1.984-2.766-1.617 0-2.672 1.148-2.672 3.195V18H7.828V8.5z"/></svg>
                0000-0002-0136-4434
              </a>
            </div>
          </div>
          <p>{{ $t('team.alix.bio') }}</p>
          <div class="team-card__links">
            <a href="https://github.com/alix-tz" target="_blank" rel="noopener" class="team-card__link">GitHub</a>
            <a href="https://alix-tz.github.io" target="_blank" rel="noopener" class="team-card__link">Website</a>
          </div>
        </div>

        <!-- Thibault -->
        <div class="team-card">
          <div class="team-card__photo-row">
            <img
              src="https://avatars.githubusercontent.com/PonteIneptique"
              class="team-card__photo"
              alt="Thibault Clérice"
              loading="lazy"
            >
            <div>
              <h2>{{ $t('team.thibault.name') }}</h2>
              <div class="team-card__role">{{ $t('team.thibault.role') }}</div>
              <a class="team-card__orcid" href="https://orcid.org/0000-0003-1852-9204" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.086 3.5h2.172v1.5h-2.172V5.5zm0 3h2.172V18h-2.172V8.5zm-3.086 0h2.172v1.5c.414-.547 1.219-1.664 2.914-1.664 2.664 0 3.914 1.773 3.914 4.57V18h-2.172v-5.094c0-1.734-.672-2.766-1.984-2.766-1.617 0-2.672 1.148-2.672 3.195V18H7.828V8.5z"/></svg>
                0000-0003-1852-9204
              </a>
            </div>
          </div>
          <p>{{ $t('team.thibault.bio') }}</p>
          <div class="team-card__links">
            <a href="https://github.com/PonteIneptique" target="_blank" rel="noopener" class="team-card__link">GitHub</a>
            <a href="https://w3id.org/dts" target="_blank" rel="noopener" class="team-card__link">DTS</a>
          </div>
        </div>
      </div>

      <!-- Publications -->
      <section class="publications">
        <h2>Publications</h2>
        <ul class="pub-list">
          <li>
            Alix Chagué, Thibault Clérice.
            <em>"I'm here to fight for ground truth": HTR-United, a solution towards a common for HTR training data</em>.
            Digital Humanities 2023, Graz, Austria.
            <a href="https://hal.science/hal-04094233" target="_blank" rel="noopener">hal-04094233</a>
          </li>
          <li>
            Thibault Clérice, Alix Chagué.
            <em>Workshop HTR-United: metadata, quality control and sharing process for HTR training data</em>.
            Digital Humanities 2023, Graz, Austria.
            <a href="https://hal.science/hal-04094235" target="_blank" rel="noopener">hal-04094235</a>
          </li>
          <li>
            Alix Chagué, Thibault Clérice, Laurent Romary.
            <em>HTR-United : un écosystème pour une approche mutualisée de la transcription automatique des écritures manuscrites</em>. 2022.
            <a href="https://hal.science/hal-04124743" target="_blank" rel="noopener">hal-04124743</a>
          </li>
          <li>
            Alix Chagué, Thibault Clérice.
            <em>Sharing HTR datasets with standardized metadata: the HTR-United initiative</em>.
            Documents anciens et reconnaissance automatique des écritures manuscrites, Paris, 2022.
            <a href="https://hal.science/hal-03703989" target="_blank" rel="noopener">hal-03703989</a>
          </li>
          <li>
            Alix Chagué, Thibault Clérice. ENC. (2022).
            <em>Sharing HTR datasets with standardized metadata: the HTR United initiative.</em>
            [Video]. Canal-U.
            <a href="https://www.canal-u.tv/133350" target="_blank" rel="noopener">canal-u.tv/133350</a>
          </li>
          <li>
            Alix Chagué.
            <em>Conditions de la mutualisation : les principes FAIR et HTR-United</em>.
            Humanistica 2022, Montréal, Canada.
            <a href="https://hal.science/hal-03685731" target="_blank" rel="noopener">hal-03685731</a>
          </li>
          <li>
            Alix Chagué, Thibault Clérice, Laurent Romary.
            <em>HTR-United : Mutualisons la vérité de terrain !</em>
            DHNord2021, Lille, France.
            <a href="https://hal.science/hal-03398740" target="_blank" rel="noopener">hal-03398740</a>
          </li>
        </ul>
      </section>
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

<style scoped>
.team-card__photo-row {
  display: flex; align-items: flex-start; gap: 18px; margin-bottom: 16px;
}
.team-card__photo {
  width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
  border: 2px solid var(--line-2); flex-shrink: 0;
}
.team-card__orcid {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--olive-deep); margin-top: 6px;
  font-family: var(--mono);
}
.team-card__orcid:hover { text-decoration: underline; }
.team-card__links { display: flex; gap: 10px; margin-top: 12px; }
.team-card__link {
  font-size: 13px; font-weight: 600; color: var(--accent);
  padding: 4px 10px; border: 1px solid var(--blue-line);
  background: var(--blue-bg); border-radius: 6px;
}
.team-card__link:hover { background: #d2e2f1; text-decoration: none; }

.publications {
  margin-top: 48px;
  max-width: 820px;
}
.publications h2 {
  font-family: var(--serif); font-size: 22px; font-weight: 600;
  color: var(--ink); margin: 0 0 20px; padding-bottom: 12px;
  border-bottom: 1px solid var(--line); letter-spacing: -.01em;
}
.pub-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 14px;
}
.pub-list li {
  font-size: 14px; line-height: 1.7; color: var(--ink-2);
  padding: 14px 16px; background: var(--surface);
  border: 1px solid var(--line); border-radius: var(--radius-sm);
}
.pub-list li em { color: var(--ink); font-style: italic; }
.pub-list li a { color: var(--accent); }
</style>
