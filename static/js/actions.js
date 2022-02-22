(function() {
  const form = document.querySelector("form"),
        receiver = document.querySelector("#output"),
        link_downloadOutput = document.querySelector("#downloadOutput"),
        link_copyOutput = document.querySelector("#copyOutput"),
        link_goToGithub = document.querySelector("#goToGithub"),
        link_editGithub = document.querySelector("#editGithub");


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
    element.setAttribute('download', "htr-united-workflows.yml");

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });

  link_copyOutput.addEventListener("click", function(e) {
    selectText(receiver);
    document.execCommand("copy");
  });

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(form));

    link_goToGithub.href = `https://github.com/${data.githubURL}/new/${data.branchName}?filename=.github/workflows/htr-united-workflows.yml`;
    link_editGithub.href = `https://github.com/${data.githubURL}/edit/${data.branchName}/.github/workflows/htr-united-workflows.yml`;



    let actions = {
      "name": "HTR United Workflow",
      "on": [
        "push",
        "pull_request"
      ],
      "jobs": {
      }
    };


    if (data.activateHTRUC) {
      actions.jobs.HTRUC = {
        "runs-on": "ubuntu-latest",
        "steps": [
          {
            "uses": "actions/checkout@v2"
          },
          {
            "name": "Set up Python 3.8",
            "uses": "actions/setup-python@v2",
            "with": {
              "python-version": 3.8
            }
          },
          {
            "name": "Install dependencies",
            "run": "python -m pip install --upgrade pip\npip install htruc\n"
          },
          {
            "name": "Run HTRUC",
            "run": `htruc test ${data.htrUnitedFilename}\n`
          }
        ]
      };
    }
    if (data.activateHUMG) {
      let dependencies = ["htr-united-metadata-generator"];
      if (data.generateBadge || data.updateCatalogFile) {
        dependencies.push("htruc");
      }
      if (data.generateBadge) {
        dependencies.push("anybadge");
      }
      actions.jobs.HTR_United_Metadata_Generator = {
        "runs-on": "ubuntu-latest",
        "env": {
          "GITHUB_TOKEN": "${{ secrets.GITHUB_TOKEN }}"
        },
        "steps": [
          {
            "uses": "actions/checkout@v2"
          },
          {
            "name": "Set up Python 3.8",
            "uses": "actions/setup-python@v2",
            "with": {
              "python-version": 3.8
            }
          },
          {
            "name": "Install dependencies",
            "run": `python -m pip install --upgrade pip\npip install ${dependencies.join(' ')}\n`
          },
          {
            "name": "Run Report",
            // No need to remote updated metrics or the envs.txt update
            "run": `humGenerator --group ${data.dataUnixPath} --github-envs --to-json updated_metrics.json\ncat envs.txt >> $GITHUB_ENV\n`
          }
        ]
      };
      if (data.generateBadge) {
        actions.jobs.HTR_United_Metadata_Generator.steps.push({
            "name": "Get HTR United Badge Template",
            "if": `github.ref == 'refs/heads/${data.branchName}'`,
            "uses": "andymckay/get-gist-action@master",
            "with": {
              "gistURL": "https://gist.github.com/PonteIneptique/7813bb99f234b334fbf9c6c429ec2406"
            }
          });
      }
      if (data.generateBadge || data.updateCatalogFile) {
        let localRun = [],
            addStuff = [],
            commitMessage = [];

        if (data.updateCatalogFile) {
          localRun.push("htruc update-volumes htr-united.yml updated_metrics.json --inplace");
          addStuff.push(data.htrUnitedFilename);
          commitMessage.push("the Catalog");
        }

        if (data.generateBadge) {
          addStuff.push("./badges/");
          commitMessage.push("the Badges");
          localRun = [
            ...localRun,
            ...[
              "# Generate badges",
              "mkdir -p badges",
              "anybadge --value=${{ env.HTRUNITED_CHARS }} --file=badges/characters.svg --label=Characters --color=#007ec6 --overwrite --template=${{ steps.get.outputs.file }}",
              "anybadge --value=${{ env.HTRUNITED_REGNS }} --file=badges/regions.svg --label=Regions --color=#007ec6 --overwrite --template=${{ steps.get.outputs.file }}",
              "anybadge --value=${{ env.HTRUNITED_LINES }} --file=badges/lines.svg --label=Lines --color=#007ec6 --overwrite --template=${{ steps.get.outputs.file }}",
              "anybadge --value=${{ env.HTRUNITED_FILES }} --file=badges/files.svg --label=\"XML Files\" --color=#007ec6 --overwrite --template=${{ steps.get.outputs.file }}",
            ]
          ];
        }

        localRun = [
          ...localRun,
          ...[
            "git config user.name github-actions",
            "git config user.email github-actions@github.com",
            `git add ${addStuff.join(' ')}`,
            `git commit -m \"[Automatic] Update ${commitMessage.join(' & ')}\" || echo \"Nothing to commit\"`,
            "git push || echo \"Nothing to push\""
          ]
        ];


        actions.jobs.HTR_United_Metadata_Generator.steps.push({
          "name": `Automatically update ${commitMessage.join(' & ')}`,
            "if": `github.ref == 'refs/heads/${data.branchName}'`,
          "run": localRun.join("\n")
        }); 
      }
      if (data.gitRelease) {
        actions.jobs.HTR_United_Metadata_Generator.steps.push({
          "uses": "rymndhng/release-on-push-action@master",
          "with": {
            "bump_version_scheme": "patch",
            "use_github_release_notes": true
          }
        });
      }
    }
    if (data.activatechocoMufin) {
      actions.jobs.ChocoMufin = {
      "runs-on": "ubuntu-latest",
      "steps": [
        {
          "uses": "actions/checkout@v2"
        },
        {
          "name": "Set up Python 3.8",
          "uses": "actions/setup-python@v2",
          "with": {
            "python-version": 3.8
          }
        },
        {
          "name": "Install dependencies",
          "run": "python -m pip install --upgrade pip\npip install chocomufin\n"
        },
        {
          "name": "Run ChocoMufin",
          "run": (data.chocoMufinMode == "generate") ? `chocomufin generate table.csv ${data.dataUnixPath}\ncat table.csv\n` : `chocomufin control table.csv ${data.dataUnixPath}\n`
        }
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
      actions.jobs.HTRVX = {
        "runs-on": "ubuntu-latest",
        "steps": [
          {
            "uses": "actions/checkout@v2"
          },
          {
            "name": "Set up Python 3.8",
            "uses": "actions/setup-python@v2",
            "with": {
              "python-version": 3.8
            }
          },
          {
            "name": "Install dependencies",
            "run": "python -m pip install --upgrade pip\npip install htrvx\n"
          },
          {
            "name": "Run HTRVX",
            "run": `htrvx --verbose --group --format ${format} ${htrvxOptions.join(' ')} ${data.dataUnixPath}\n`
          }
        ]
      }
    }

    output.innerText = "# This file has been generated automatically with HTR-United <3 Github Actions form\n"+jsyaml.dump(actions, {"noRef": true, "lineWidth": -1});
  })
})();