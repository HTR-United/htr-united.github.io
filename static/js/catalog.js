const catalogURI = "https://htr-united.github.io/htr-united/catalog.json"; 

const catalogDiv = document.querySelector("#card-receiver"),
  notAfterSelector = document.querySelector("#notAfter"),
  notBeforeSelector = document.querySelector("#notBefore"),
  scriptTypeFilter = document.querySelector("#scriptType"),
  resultCount = document.querySelector("#resultCount"),
  showGuidelines = document.querySelector("#showGuidelines"),
  showCitations = document.querySelector("#showCitations"),
  projectSelect = document.querySelector("#projectSelect"),
  languageSelect = document.querySelector("#dataLanguage"),
  scriptSelect = document.querySelector("#dataScript"),
  table = document.querySelector("#table"),
  tableChars = document.querySelector("#table [data-unit=\"characters\"]"),
  tableLines = document.querySelector("#table [data-unit=\"lines\"]"),
  noProjectLabel = "Not defined",
  projectObject = {};
  projectObject[noProjectLabel] = 0;
let msnry;


function dispatchZotero() {
  try {
    Zotero.monitorDOMChanges(catalogDiv);
  } catch {
    console.log("Zotero unavailable.");
  }
};

/**
 * 
 * DOM Generic functions
 * 
 * */

function toggleGuidelines() {
  /** Toggles the visibility of guidelines */
  if (showGuidelines.checked) {
    catalogDiv.classList.add("show-guidelines");
  } else {
    catalogDiv.classList.remove("show-guidelines");
  }
}

function toggleCitations() {
  /** Toggles the visibility of citations */
  if (showCitations.checked) {
    catalogDiv.classList.add("show-citations");
  } else {
    catalogDiv.classList.remove("show-citations");
  }
}

function selectText(node) {
  /** Select the text inside `node` */
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * 
 * UTILS
 * 
 * */

function nl2br(str) {
  /* Replace line breaks with <br/> HTML tags inside `str` */
  return (str + '').replace(/(\r\n|\n\r|\r|\n)/g, '<br />');
}

function createElementFromHTML(htmlString) {
  /* Transform the html string into a HTML node */
  let div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

function slugify(str) {
  /* Slugify the string (normalize for id, links, etc) */
  str = str.replace(/^\s+|\s+$/g, '');

  // Make the string lowercase
  str = str.toLowerCase();

  // Remove accents, swap ñ for n, etc
  var from = "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;";
  var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  // Remove invalid chars
  str = str.replace(/[^a-z0-9 -]/g, '')
    // Collapse whitespace and replace by -
    .replace(/\s+/g, '-')
    // Collapse dashes
    .replace(/-+/g, '-');

  return str;
}

/**
 * 
 * Catalog HTML production
 * 
 * */

function getVolumes(listOfValue) {
  /* Produces a HTML sequence of volume badges based on a the Volume Catalog Entry list */
  return listOfValue.map((val) => `<span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-volumes rounded-start text-white border border-secondary border-end-0 py-1 px-2"><span class="fas fa-database"></span> Volume</span><span class="rounded-end text-dark border border-secondary py-1 px-2">${val.count.toLocaleString()} ${val.metric}</span></span>`).join(" ")
}

function getImages(listOfValue, label, color) {
  /* Produces a HTML sequence of volume badges based on a list of string 
   *    (label is used as the left label, color as the css color class) 
   * */
  return listOfValue.map((val) => `<span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-${color}  rounded-start text-white border border-secondary border-end-0 py-1 px-2">${label}</span><span class="rounded-end text-dark border border-secondary py-1 px-2">${val}</span></span>`).join(" ")
}

function getTypeBadge(scriptType) {
  /* Produces a HTML badge based on the script type values
   * */
  if (typeof scriptType !== "string") {
    return "";
  }
  let badge = "fa-archive";
  if (scriptType.includes("manuscript")) {
    badge = "fa-pen-fancy";
  } else if (scriptType.includes("typed")) {
    badge = "fa-print";
  }
  return `<span class="badge badge-sm p-0 m-1 mb-3">
        <span class="bg-script-type rounded-start text-white border border-secondary border-end-0 py-1 px-2">Script Type</span><span class="rounded-end border border-secondary text-dark py-1 px-2"><span class="fas ${badge}"></span> ${scriptType}</span>
      </span>`
}
function getCharactersBadge(catalogEntry) {
  if (catalogEntry.characters !== undefined && catalogEntry.characters.members !== undefined) {
    let normalization = "";
    if (catalogEntry.characters.mode && catalogEntry.characters.mode != "None") {
      normalization = ` (${catalogEntry.characters.mode})`
    }
    return `<span class="badge badge-sm p-0 m-1 mb-3">
    <span class="bg-volumes rounded-start text-white border border-secondary border-end-0 py-1 px-2"><span class="fas fa-spell-check"></span> Known characters${normalization}</span><span class="rounded-end text-dark border border-secondary py-1 px-2">${catalogEntry.characters.members.length.toLocaleString()}</span></span>`;
  }
  return ``;
}
function getSoftwareBadge(catalogEntry) {
  if (catalogEntry["production-software"] === undefined) { return ``; }
  return `<p class="my-0">
      <span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-software rounded-start text-white border border-secondary border-end-0 py-1 px-2"><span class="fas fa-desktop"></span> <span vanilla-i18n="cat.software">Software</span></span><span class="rounded-end border border-secondary text-dark py-1 px-2">${catalogEntry['production-software']}</span></span>
    </p>`;
}

function citationCFF(link) {
  /** Creates a citation link if the entry is given */
  if (link) {
    return `<a href="${link}"><span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-link rounded-start text-white border border-secondary border-end-0 py-1 px-2"><span class="fa fa-link"></span> <span vanilla-i18n="cat.link">Link</span></span><span class="rounded-end border border-secondary text-dark py-1 px-2" vanilla-i18n="cat.citationFile">Citation File</span></span>
      </a>`;
  } else {
    return "";
  }
}

function getAuthors(catalogEntry) {
  /** Creates a HTML paragraph with a list of authors */
  if (catalogEntry.authors) {
    return `<p class="card-text"><b><i18n vanilla-i18n="cat.authors">Auteur.rice.s </i18n>:</b> ${catalogEntry.authors.map((val) => {
      if (val.name !== undefined) { return val.name + ', ' + val.surname; } else { return val.surname; }
    }).join(' and ')}</p>`;
  } else {
    return "";
  }
}

function transcriptionRules(catalogEntry) {
  /** Creates a HTML section with the transcription guidelines */
  if (catalogEntry['transcription-guidelines']) {
    return `<div class="card-body transcriptionRules">
    <h6 vanilla-i18n="form.field.guidelines.label">Transcriptions Guidelines</h6>
    <p class="card-text">${nl2br(catalogEntry['transcription-guidelines'])}</p>
  </div>`;
  } else {
    return "";
  }
}

function cleanUpString(string) {
  return string.trim().replace(/'+$/, "");
}

function getProjectName(catalogEntry, alt_value){
  if (alt_value === undefined){ alt_value = "";}
  return cleanUpString(catalogEntry['project-name'] || `${noProjectLabel}`);
}

function getProjectNameHTML(catalogEntry) {
  if (catalogEntry["project-name"] !== undefined) {
    return `<h6 class="card-subtitle text-muted">${cleanUpString(catalogEntry['project-name'])}</h6>`;
  }
  return ``;
}

function getYear(entryTime) {
  if (entryTime.notBefore !== entryTime.notAfter) {
    return `${entryTime.notBefore.split('-')[0]} - ${entryTime.notAfter.split('-')[0]}`;
  }
  return `${entryTime.notBefore.split('-')[0]}`;
}

function ifLong(isLong, value) {
  if (isLong) {
    return value;
  }else {return ""}
}

function getCitation(catalogEntry) {
  if(catalogEntry._bibtex === undefined) {
    return `<pre>@misc{htr_united_${slugify(catalogEntry.url)},
  type       = dataset,
  author     = {${(catalogEntry.authors || []).map((val) => val.name + ', ' + val.surname).join(' and ')}},
  title      = {${catalogEntry.title}},
  publisher  = {HTR United},
  editor     = {Chagué, Alix and Clérice, Thibault},
  url        = {${catalogEntry.url}}
}</pre>`
  }
  else if (catalogEntry._apa) {
    return `<pre>${catalogEntry._bibtex}</pre><h8>APA</h8><small>${catalogEntry._apa}</small>`;
  } else {
    return `<pre>${catalogEntry._bibtex}</pre>`;
  }
}

function coins(catalogEntry) {
  let search = new URLSearchParams("ctx_ver=Z39.88-2004&url_ver=Z39.88-2004");
  search.append("rft.title", catalogEntry.title.trim());
  search.append("rft.genre", "document");
  search.append("rft.publisher", "HTR-United");
  if(catalogEntry["project-name"]) {
    search.append("rft.isPartOf", catalogEntry["project-name"]);
  }
  catalogEntry.authors.forEach((value) => {
    if (value.name !== undefined) { 
      search.append("rft.aufirst", value.surname); 
      search.append("rft.aulast", value.name); 
    } else {
      search.append("rft.aufirst", value.surname); 
      search.append("rft.aulast", ""); 
    }
  });
  search.append("rft.type", "Document");
  search.append("rft.language", catalogEntry.language[0]);
  search.append("rft.subject", "Ground truth");
  search.append("rft.subject", "HTR");
  search.append("rft.description", catalogEntry.description);
  search.append("rft.identifier", catalogEntry.url.trim());
  search.append("rft_val_fmt", "info:ofi/fmt:kev:mtx:book");
  search.append("rft.rights", catalogEntry.license[0].name);
  return search.toString();
}
function getFlags(catalogEntry) {
  text = ""
  if(catalogEntry["automatically-aligned"]) {
    text += `<span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-flags rounded-start text-white border border-secondary border-end-0 py-1 px-2"><i class="fas fa-exchange-alt"></i></span><span class="rounded-end border border-secondary text-dark py-1 px-2" vanilla-i18n="form.field.flags.automaticallyAligned.label">Automatically aligned</span></span>`;
  }
  if (text) {
    return "<br />" + text;
  }
  return text;
}

function template(catalogEntry, key, isLong) {
  /** Generates the whole DIV for a specific catalog entry with `key` in the original JSON */
  return createElementFromHTML(`<div class="card catalog-card" data-key="${key}" data-project="${updateProjects(getProjectName(catalogEntry))}">
    <span class="Z3988" title="${coins(catalogEntry)}"></span>
  <div class="card-header bg-secondary rounded-top">
  ${catalogEntry.title}
  </div>
  <div class="secondary-header">
    ${getProjectNameHTML(catalogEntry)}
    <h7>${getYear(catalogEntry.time)}</h7>
  </div>
  <div class="card-body pt-1">
    <p class="my-0">
      <a href="${catalogEntry.url}"><span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-link rounded-start text-white border border-secondary border-end-0 py-1 px-2"><span class="fa fa-link"></span> <span vanilla-i18n="cat.link">Link</span></span><span class="rounded-end border border-secondary text-dark py-1 px-2" vanilla-i18n="cat.repository">Data repository</span></span></a>
      ${citationCFF(catalogEntry['citation-file-link'])}
    </p>
    <hr />
    <p class="my-0">
      ${getImages(catalogEntry.language, "Language", "language")}
      ${getImages(catalogEntry.script_simplified, "Script", "script")}
      ${getTypeBadge(catalogEntry['script-type'])}
      <span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-hands rounded-start text-white border border-secondary border-end-0 py-1 px-2">Hands</span><span class="rounded-end border border-secondary text-dark py-1 px-2">${catalogEntry.hands.count}</span></span>
      ${getFlags(catalogEntry)}
      </p>
    <p class="my-0">${getVolumes(catalogEntry.volume)} ${getCharactersBadge(catalogEntry)}</p>
    <p class="my-0">
      <span class="badge badge-sm p-0 m-1 mb-3"><span class="bg-license rounded-start text-white border border-secondary border-end-0 py-1 px-2">License</span><span class="rounded-end border border-secondary text-dark py-1 px-2">${catalogEntry.license[0].name}</span></span>
    </p>
    ${getSoftwareBadge(catalogEntry)}
  </div>
  <div class="card-body">
    ${ifLong(isLong, "<h6>Description</h6>")}
    <p class="card-text">${nl2br(catalogEntry.description)}</p>
    ${getAuthors(catalogEntry)}
  </div>
  ${transcriptionRules(catalogEntry)}
  <div class="card-body citation">
    <h6>Citation</h6>
    <h8>Bibtex <span class="fa fa-copy citation-copy"></span></h8>
    ${getCitation(catalogEntry)}
  </div>
  <div class="card-body shares">
    <a class="btn btn-sm btn-primary" href="share.html?uri=${catalogEntry._pid}"><i class="fas fa-share"></i> <span vanilla-i18n="cat.full_record">Full-size record</a></a>
    <a class="btn btn-sm btn-secondary" href="https://twitter.com/intent/tweet?text=${encodeURI(catalogEntry.title)}&url=${encodeURI('https://htr-united.github.io/share.html?uri='+catalogEntry._pid)}&hashtags=HTR_United"><i class="fas fa-hashtag"></i> <span vanilla-i18n="cat.tweet">Tweet</a></a>
  </div>
</div>`);
}

/**
 *
 * Catalog Retrieval and display
 * 
 * */

async function getCatalog() {
  /* Retrieves the catalog data */
  console.log(`Fetching ${catalogURI}`);
  var res = await fetch(catalogURI).then((response) => {
    console.log(response);
    if (response.ok) {
      return response.json();
    }
    throw new Error('Something went wrong');
  }).catch((error) => {
    console.log(error);
    return;
  });
  return res;
};

function updateProjects(current_project) {
  current_project = current_project.trim();
  if (current_project in projectObject) {
    return projectObject[current_project];
  } else {
    projectObject[current_project] = Object.keys(projectObject).length;
    return projectObject[current_project];
  }
};

function updateProjectSelect() {
  Object.keys(projectObject).sort().forEach((key) => {
    projectSelect.append(createElementFromHTML(`<option value="${projectObject[key]}">${key}</option>`))
  });
};
function updateLanguageSelect(entry_langs, knownLangs) {
  entry_langs.forEach((lang) => {
    if (!(knownLangs.includes(lang))) {
      knownLangs.push(lang);
    }
  }); 
};
function updateScriptSelect(entryScript, knownScripts) {
  entryScript.forEach((script) => {
    if (!(knownScripts.includes(script.iso))) {
      knownScripts.push(script.iso);
    }
  }); 
};

function bindCitation(catalogDiv) {
  catalogDiv.querySelectorAll(".citation").forEach((divEl) => {
    console.log(divEl);
    divEl.querySelector(".citation-copy").addEventListener("click", function(e) {
      selectText(divEl.querySelector("pre"));
      document.execCommand("copy");
    })
  });
}


async function showCatalog() {
  /* Insert the catalog in the HTML */
  const CATALOG = await getCatalog();
  let minDate = +5000,
    maxDate = -5000,
    knownLangs = [],
    knownScripts = [],
    volumes = {
      "characters": 0,
      "lines": 0
    };

  // Produce and 
  Object.keys(CATALOG).sort((key1, key2) => (CATALOG[key1].title < CATALOG[key2].title) ? -1 : 1).forEach((key) => {
    // Quick fix to hide CREMMA repositories
    let counts_is_zero = false;
    (CATALOG[key].volume || []).forEach((data) => {
      if(data.count === 0) {
        counts_is_zero = true;
      } else {
        counts_is_zero = false;
      }
    });
    if (counts_is_zero) {
      return;
    }

    updateLanguageSelect(CATALOG[key].language, knownLangs);
    CATALOG[key].script_simplified = CATALOG[key].script.map(val => val.iso);
    updateScriptSelect(CATALOG[key].script, knownScripts);
    let div = template(CATALOG[key], key);
    try {
      CATALOG[key].time.notBeforeInt = parseInt(CATALOG[key].time.notBefore.split("-")[0]);
      CATALOG[key].time.notAfterInt = parseInt(CATALOG[key].time.notAfter.split("-")[0]);
      if (CATALOG[key].time.notAfterInt > maxDate) {
        maxDate = CATALOG[key].time.notAfterInt;
      }
      if (CATALOG[key].time.notBeforeInt < minDate) {
        minDate = CATALOG[key].time.notBeforeInt;
      }
    } catch (e) {
      console.log("Error on parsing time for " + key);
      console.log(e);
    }
    catalogDiv.append(div);
  });

  // Add value to langs 
  knownLangs.sort().forEach((lang) => {
    languageSelect.append(createElementFromHTML(`<option value="${lang}">${lang}</option>`));
  });
  knownScripts.sort().forEach((lang) => {
    scriptSelect.append(createElementFromHTML(`<option value="${lang}">${lang}</option>`));
  });
  bindCitation(catalogDiv);
  notBeforeSelector.value = minDate;
  notAfterSelector.value = maxDate;

  function inRange(minStart, minEnd, dataStart, dataEnd) {
    return (dataStart <= minEnd) && (minStart <= dataEnd);
  }

  function scriptTypeFilterFn(entry, filterValue) {
    const values = {
      "50-print": ["only-typed","mainly-typed", "evenly-mixed"], //, "evenly-mixed"],
      "50-mss": ["only-manuscript", "mainly-manuscript", "evenly-mixed"]
    }
    if (filterValue == "all") {
      return true;
    }
    if (filterValue === "50-print" || filterValue === "50-mss") {
      return values[filterValue].includes(entry["script-type"]);
    }
    return (entry['script-type'] == filterValue);
  }

  function updateResultCount() {
    resultCount.innerText = catalogDiv.querySelectorAll(".card:not([style*='none'])").length;
  }
  function projectFilterFn(catalogEntry, selectedProject) {
    if (selectedProject === "-1") {
      return true;
    }
    return (projectObject[getProjectName(catalogEntry)] == selectedProject);
  }
  function languageFilterFn(projectLangs, language) {
    if (language == "-1") { return true; }
    return projectLangs.includes(language);
  }
  function scriptFilterFn(projectScripts, script) {
    if (script == "-1") { return true; }
    return projectScripts.includes(script);
  }
  function updateVolume(entry) {
    (entry.volume || []).forEach((vol) => {
      if(vol.metric in volumes) {
        volumes[vol.metric].push(vol.count);
      }
    });
  }
  function resetVolumes(vols) {
    Object.keys(vols).forEach((key) => {
      volumes[key] = [];
    });
  }
  function updateTableCount() {
    tableChars.querySelector("td.amount").innerText = new Intl.NumberFormat(navigator.language || navigator.userLanguage).format(
      volumes.characters.reduce((partialSum, a) => partialSum + a, 0)
    );
    tableChars.querySelector("td.project-count").innerText = volumes.characters.length;
    tableLines.querySelector("td.amount").innerText = new Intl.NumberFormat(navigator.language || navigator.userLanguage).format(
      volumes.lines.reduce((partialSum, a) => partialSum + a, 0)
    );
    tableLines.querySelector("td.project-count").innerText = volumes.lines.length;
  }
  function applyFilters() {
    let localMin = parseInt(notBeforeSelector.value),
      localMax = parseInt(notAfterSelector.value),
      localScriptTypeFilter = scriptTypeFilter.value,
      localProjectSelect = projectSelect.value,
      localLanguageSelect = languageSelect.value,
      localScriptSelect = scriptSelect.value;
    resetVolumes(volumes);

    document.querySelectorAll(".catalog-card").forEach((div) => {
    	div.style.display = "none";
    	div.style.visibility = "hidden"
    });
    Object.keys(CATALOG).forEach((key) => {
      if (
        // Filter for dates
        (inRange(localMin, localMax, CATALOG[key].time.notBeforeInt, CATALOG[key].time.notAfterInt)) &&
        // Filter for script type
        (scriptTypeFilterFn(CATALOG[key], localScriptTypeFilter)) &&
        // Filter for project
        (projectFilterFn(CATALOG[key], localProjectSelect)) &&
        // Filter for language
        (languageFilterFn(CATALOG[key].language, localLanguageSelect)) &&
        // Filter for script
        (scriptFilterFn(CATALOG[key].script_simplified, localScriptSelect))
      ) {
        let ldiv = document.querySelector(`.catalog-card[data-key="${key}"]`)
      	ldiv.style.display = "block";
      	ldiv.style.visibility = "visible";
        updateVolume(CATALOG[key]);
      }
    });
    updateResultCount();
    updateTableCount();
    //msnry.reloadItems();
    //msnry.layout();
  };
  updateProjectSelect();

  notBeforeSelector.addEventListener('change', applyFilters);
  notAfterSelector.addEventListener('change', applyFilters);
  scriptTypeFilter.addEventListener('change', applyFilters);
  projectSelect.addEventListener('change', applyFilters);
  languageSelect.addEventListener('change', applyFilters);
  scriptSelect.addEventListener('change', applyFilters);
  toggleGuidelines();
  toggleCitations();
  i18n_item.run();
  /*
  msnry = new Masonry('.grid', {
    // set itemSelector so .grid-sizer is not used in layout
    itemSelector: '.grid-item',
    // use element for option
    columnWidth: '.catalog-card',
    percentPosition: true
  });
  */
  applyFilters();
  /**
   * Apply Masonry
   * 
   * */
   dispatchZotero();
}

const currentHTML = window.location.pathname.split("/").pop();


async function getSingleCard(catalogEntryURI) {
  const CATALOG = await getCatalog();
  const catalogEntry = Object.entries(CATALOG).filter(
    ([key, value]) => (value.url == catalogEntryURI) || (key == catalogEntryURI)
  ).pop().pop(-1);
  
  catalogEntry.script_simplified = catalogEntry.script.map(val => val.iso);
  catalogDiv.append(template(catalogEntry, catalogEntryURI, true));
  bindCitation(catalogDiv);
  document.title = `${catalogEntry.title} | ${document.title}`;

  document.querySelector('meta[property="og:title"]').setAttribute("content", catalogEntry.title + " | HTR-United Record");
  document.querySelector('meta[name="description"]').setAttribute("content", catalogEntry.description);
  // dispatchZotero();
}
if (currentHTML == "catalog.html") {
  showGuidelines.addEventListener("change", toggleGuidelines);
  showCitations.addEventListener("change", toggleCitations);
  showCatalog();
} else {
  if (window.location.search) {
    let params = new URLSearchParams(window.location.search),
        catalogEntryURI = params.get("uri");
        if (catalogEntryURI !== undefined && catalogEntryURI) {
          getSingleCard(catalogEntryURI);
          i18n_item.run();
        }
  };
}
