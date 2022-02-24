#!/usr/bin/env bash

# Purpose: compile i18n files and run
#           a local server for test in
#           browser.
# --------------------------------------

if [[ "$OSTYPE" == msys ]]; then
    echo 'Compile language files'
    cd .\assets\vanilla-i18n && py compile.py 

    echo 'Start local server'
    echo 'Open http://0.0.0.0:8000/ or localhost:8000/ 
            once the server has started'
    py -m http.server

else
    echo 'Compile language files'
    cd ./assets/vanilla-i18n/ && python3 compile.py 

    echo 'Start local server'
    echo 'Open http://0.0.0.0:8000/ or localhost:8000/ 
            once the server has started'
    python3 -m http.server
fi