(function() {
  const form = document.querySelector("form"),
        receiver = document.querySelector("#output"),
        link_downloadOutput = document.querySelector("#downloadOutput"),
        link_copyOutput = document.querySelector("#copyOutput"),
        link_editGitlab = document.querySelector("#editGitlab"),
        readmeBadges = document.querySelector("#readmeBadges"),
        link_copyReadme = document.querySelector("#copyReadmeOutput"),
        link_editReadme = document.querySelector("#editReadmeGitlab");


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



  link_downloadOutput.addEventListener("click", function (e) {
    e.preventDefault();
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiver.innerText));
    element.setAttribute('download', ".gitlab-ci.yml");

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });

  link_copyOutput.addEventListener("click", function(e) {
    selectText(receiver);
    document.execCommand("copy");
  });

  link_copyReadme.addEventListener("click", function(e) {
    selectText(readmeBadges);
    document.execCommand("copy");
  });

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(form));
    let gitlabUrl = URL.parse(data.gitlabURL);
    let apiUrl = gitlabUrl;
    apiUrl.pathname = `/api/v4/projects/${encodeURIComponent(apiUrl.pathname.substring(1))}`;

    link_editGitlab.href = `${data.gitlabURL}/-/ci/editor?branch_name=${data.branchName}`;
    link_editReadme.href = `${data.gitlabURL}`;

    if (data.generateBadge && data.activateHUMG) {
      document.querySelector("#addBadgesSection").classList.remove("d-none");
    } else {
      document.querySelector("#addBadgesSection").classList.add("d-none");
    }

    let pipeline = {
    };


    if (data.activateHTRUC) {
      pipeline.HTRUC = {
        "image": "ghcr.io/astral-sh/uv:python3.8-bookworm",
        "script": [
          `uv run --with=htruc htruc test ${data.htrUnitedFilename}`,
        ]
      };
    }
    if (data.activateHUMG) {
      let HUMGformat = (data.format == "Alto-XML") ? "alto" : "page";
      pipeline.HTR_United_Metadata_Generator = {
        "image": "ghcr.io/astral-sh/uv:python3.8-bookworm",
        "script": [
          `uv run --with=htr-united-metadata-generator humGenerator --chars -n NFD --parse ${HUMGformat} --group ${data.dataUnixPath} --github-envs --to-json updated_metrics.json`,
        ]
      };
      if (data.generateBadge) {
        pipeline.HTR_United_Metadata_Generator.script.push(
          "wget https://gist.githubusercontent.com/PonteIneptique/7813bb99f234b334fbf9c6c429ec2406/raw/anybadge.svg",
        );
      }
      if (data.generateBadge || data.updateCatalogFile) {
        let localRun = [`test "$CI_COMMIT_BRANCH" = ${data.branchName} || exit 0`],
            addStuff = [];

        if (data.updateCatalogFile) {
          localRun.push("uv run --with=htruc htruc update-volumes htr-united.yml updated_metrics.json --inplace");
          addStuff.push(data.htrUnitedFilename);
        }

        if (data.generateBadge) {
          addStuff.push("./badges/");
          localRun = [
            ...localRun,
            ...[
              "mkdir -p badges",
              "source envs.txt",
              `uv run --with=anybadge anybadge --value="$HTRUNITED_CHARS" --file=badges/characters.svg --label=Characters --color=#007ec6 --overwrite --template=anybadge.svg`,
              `uv run --with=anybadge anybadge --value="$HTRUNITED_REGNS" --file=badges/regions.svg --label=Regions --color=#007ec6 --overwrite --template=anybadge.svg`,
              `uv run --with=anybadge anybadge --value="$HTRUNITED_LINES" --file=badges/lines.svg --label=Lines --color=#007ec6 --overwrite --template=anybadge.svg`,
              `uv run --with=anybadge anybadge --value="$HTRUNITED_FILES" --file=badges/files.svg --label='XML Files' --color=#007ec6 --overwrite --template=anybadge.svg`,
            ]
          ];
        }

        pipeline.HTR_United_Metadata_Generator.script.push(...localRun); 
        pipeline.HTR_United_Metadata_Generator.artifacts = {
          "paths": addStuff,
        };
      }
    }
    if (data.activatechocoMufin) {
      pipeline.ChocoMufin = {
      "image": "ghcr.io/astral-sh/uv:python3.8-bookworm",
      "script": [
        (data.chocoMufinMode == "generate") ? `uv run --with=chocomufin chocomufin generate table.csv ${data.dataUnixPath}\ncat table.csv` : `uv run --with=chocomufin chocomufin control table.csv ${data.dataUnixPath}`,
      ]
    }
    }
    if (data.activateHTRVX) {
      let format = (data.format == "Alto-XML") ? "alto" : "page",
          htrvxOptions = [];
      //if (data.)
      if (data.activateEmptyLine || data.activateRaiseEmptyLine) {
        htrvxOptions.push("--check-empty");
      }
      if (data.activateSegmonto) {
        htrvxOptions.push("--segmonto");
      }
      if (data.activateXSD) {
        htrvxOptions.push("--xsd");
      }
      if (data.activateRaiseEmptyLine) {
        htrvxOptions.push("--raise-empty");
      }
      //htrvxoptions.push()
      pipeline.HTRVX = {
        "image": "ghcr.io/astral-sh/uv:python3.8-bookworm",
        "script": [
          `uv run --with=htrvx htrvx --verbose --group --format ${format} ${htrvxOptions.join(' ')} ${data.dataUnixPath}`,
        ]
      }
    }

    readmeBadges.innerText = ['characters', 'regions', 'lines', 'files'].map(badge => `![characters ${badge}](${apiUrl}/jobs/artifacts/${data.branchName}/raw/badges/${badge}.svg?job=HTR_United_Metadata_Generator)`).join(' ');
    output.innerText = "# This file has been generated automatically with HTR-United <3 GitLab CI form\n"+jsyaml.dump(pipeline, {"noRef": true, "lineWidth": -1});
  })
})();
