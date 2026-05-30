<template>
  <div style="display:flex;flex-direction:column;min-height:100vh">
    <TopBar active-page="actions" />
    <div class="pagehead">
      <h1>{{ $t('actions.title') }}</h1>
      <p>{{ $t('actions.intro') }}</p>
    </div>

    <div class="form-page">
      <!-- General info -->
      <div class="form-section">
        <h2>{{ $t('actions.generalInfo') }}</h2>
        <div class="form-group">
          <label class="form-label">{{ $t('actions.githubURL') }}</label>
          <input class="form-input" v-model="cfg.githubUrl" placeholder="https://github.com/username/repository">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ $t('actions.htrucFilename') }}</label>
            <input class="form-input" v-model="cfg.catalogFile" placeholder="htr-united.yml">
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('actions.branchName') }}</label>
            <input class="form-input" v-model="cfg.branch" placeholder="main">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ $t('actions.dataPath') }}</label>
          <input class="form-input" v-model="cfg.dataPath" placeholder="./data/**/*.xml">
        </div>
      </div>

      <!-- HTRUC -->
      <div class="form-section">
        <h2>{{ $t('actions.testCatalog') }}</h2>
        <label class="checkbox-item" style="margin-bottom:12px">
          <input type="checkbox" v-model="cfg.htruc"> {{ $t('actions.activateHTRUC') }}
        </label>
        <template v-if="cfg.htruc">
          <label class="checkbox-item" style="margin-bottom:8px">
            <input type="checkbox" v-model="cfg.updateCatalog"> {{ $t('actions.updateCatalog') }}
          </label>
          <label class="checkbox-item" style="margin-bottom:8px">
            <input type="checkbox" v-model="cfg.generateBadge"> {{ $t('actions.generateBadge') }}
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="cfg.gitRelease"> {{ $t('actions.gitRelease') }}
          </label>
        </template>
      </div>

      <!-- HUMGenerator -->
      <div class="form-section">
        <h2>{{ $t('actions.testReport') }}</h2>
        <label class="checkbox-item">
          <input type="checkbox" v-model="cfg.humg"> {{ $t('actions.activateHUMG') }}
        </label>
      </div>

      <!-- HTRVX -->
      <div class="form-section">
        <h2>{{ $t('actions.testXML') }}</h2>
        <label class="checkbox-item" style="margin-bottom:12px">
          <input type="checkbox" v-model="cfg.htrvx"> {{ $t('actions.activateHTRVX') }}
        </label>
        <template v-if="cfg.htrvx">
          <label class="checkbox-item" style="margin-bottom:8px">
            <input type="checkbox" v-model="cfg.segmonto"> {{ $t('actions.activateSegmonto') }}
          </label>
          <label class="checkbox-item" style="margin-bottom:8px">
            <input type="checkbox" v-model="cfg.emptyLine"> {{ $t('actions.activateEmptyLine') }}
          </label>
          <label class="checkbox-item" style="margin-bottom:8px">
            <input type="checkbox" v-model="cfg.raiseEmptyLine" :disabled="!cfg.emptyLine"> {{ $t('actions.raiseEmptyLine') }}
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="cfg.xsd"> {{ $t('actions.activateXSD') }}
          </label>
        </template>
      </div>

      <!-- ChocoMufin -->
      <div class="form-section">
        <h2>{{ $t('actions.testChars') }}</h2>
        <label class="checkbox-item" style="margin-bottom:12px">
          <input type="checkbox" v-model="cfg.choco"> {{ $t('actions.activateChocoMufin') }}
        </label>
        <template v-if="cfg.choco">
          <div class="form-group">
            <label class="form-label">{{ $t('actions.chocoMufinMode') }}</label>
            <select class="form-input form-select" v-model="cfg.chocoMode">
              <option value="generate">Generate</option>
              <option value="control">Control</option>
            </select>
          </div>
        </template>
      </div>

      <!-- Output -->
      <div class="output-section">
        <h2>{{ $t('actions.generate') }}</h2>
        <button class="btn btn--olive btn--lg" @click="generate" style="margin-bottom:16px">
          {{ $t('actions.generate') }}
        </button>
        <textarea class="output-area" readonly :value="output" rows="30"></textarea>
        <div class="output-actions" v-if="output">
          <button class="btn btn--ghost" @click="copyOutput">{{ copied ? '✓ Copied' : $t('actions.copy') }}</button>
          <a class="btn btn--ghost" :href="downloadHref" download=".github/workflows/htr-united.yml">{{ $t('actions.download') }}</a>
          <a v-if="addFileUrl" class="btn btn--primary" :href="addFileUrl" target="_blank" rel="noopener">{{ $t('actions.addFile') }} GitHub</a>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../TopBar.vue'
import AppFooter from '../AppFooter.vue'

const { t } = useI18n()

const cfg = reactive({
  githubUrl: '', catalogFile: 'htr-united.yml', branch: 'main', dataPath: './data/**/*.xml',
  htruc: false, updateCatalog: false, generateBadge: false, gitRelease: false,
  humg: false,
  htrvx: false, segmonto: false, emptyLine: false, raiseEmptyLine: false, xsd: true,
  choco: false, chocoMode: 'generate',
})

const output = ref('')
const copied = ref(false)

function generate() {
  const lines = []
  const repo = cfg.githubUrl.replace('https://github.com/', '')
  lines.push('name: HTR-United Quality Assurance')
  lines.push('on:')
  lines.push('  push:')
  lines.push(`    branches: [ ${cfg.branch} ]`)
  lines.push('  workflow_dispatch:')
  lines.push('')
  lines.push('jobs:')
  lines.push('  qa:')
  lines.push('    runs-on: ubuntu-latest')
  lines.push('    steps:')
  lines.push('      - uses: actions/checkout@v3')
  lines.push('')
  lines.push('      - name: Set up Python')
  lines.push('        uses: actions/setup-python@v4')
  lines.push('        with:')
  lines.push("          python-version: '3.10'")
  lines.push('')

  if (cfg.htruc || cfg.updateCatalog) {
    lines.push('      - name: Install HTRUC')
    lines.push('        run: pip install htruc')
    lines.push('')
    lines.push('      - name: Test catalog file')
    lines.push(`        run: htruc test ${cfg.catalogFile}`)
    lines.push('')
  }

  if (cfg.humg || cfg.updateCatalog) {
    lines.push('      - name: Install HUMGenerator')
    lines.push('        run: pip install humGenerator')
    lines.push('')
    lines.push('      - name: Generate metrics')
    lines.push(`        run: humgenerator -o ${cfg.catalogFile} ${cfg.dataPath}`)
    lines.push('')
  }

  if (cfg.htrvx) {
    lines.push('      - name: Install HTRVX')
    lines.push('        run: pip install htrvx')
    lines.push('')
    const flags = []
    if (cfg.segmonto)   flags.push('--segmonto')
    if (cfg.emptyLine)  flags.push('--check-empty-line')
    if (cfg.raiseEmptyLine) flags.push('--raise-empty-line')
    if (cfg.xsd)        flags.push('--xsd')
    lines.push('      - name: Test XML files')
    lines.push(`        run: htrvx ${cfg.dataPath} ${flags.join(' ')}`)
    lines.push('')
  }

  if (cfg.choco) {
    lines.push('      - name: Install ChocoMufin')
    lines.push('        run: pip install chocomufin')
    lines.push('')
    lines.push('      - name: Run ChocoMufin')
    lines.push(`        run: chocomufin ${cfg.chocoMode} ${cfg.dataPath}`)
    lines.push('')
  }

  if (cfg.updateCatalog || cfg.generateBadge) {
    lines.push('      - name: Commit updated files')
    lines.push('        run: |')
    lines.push('          git config user.email "actions@github.com"')
    lines.push('          git config user.name "GitHub Actions"')
    lines.push(`          git add ${cfg.catalogFile}`)
    lines.push('          git commit -m "[Automatic] Update catalog" || echo "Nothing to commit"')
    lines.push('          git push')
    lines.push('')
  }

  if (cfg.gitRelease) {
    lines.push('      - name: Create release')
    lines.push('        uses: softprops/action-gh-release@v1')
    lines.push('        if: startsWith(github.ref, "refs/tags/")')
  }

  output.value = lines.join('\n')
}

const downloadHref = computed(() => {
  if (!output.value) return '#'
  return URL.createObjectURL(new Blob([output.value], { type: 'text/yaml' }))
})

const addFileUrl = computed(() => {
  if (!cfg.githubUrl || !output.value) return null
  const repo = cfg.githubUrl.replace('https://github.com/', '').replace(/\/$/, '')
  return `https://github.com/${repo}/new/main?filename=.github%2Fworkflows%2Fhtr-united.yml`
})

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>
