#!/bin/bash

# Exemple avec un modèle peu cher qui fait juste de l'auto-complétion

# POSITIONNER UNE VARIABLE SHELL $OPEN_API_KEY AVEC LA CLEF D'API OPENAI
# sous bash/mac/linux :
# export OPENAI_API_KEY=.....
#
# Sous windows/dos :
# set OPENAI_API_KEY=.....

curl https://api.openai.com/v1/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo-instruct",
    "prompt": "Propose un nom pour la MIAGE de Nice: ",
    "max_tokens": 7,
    "temperature": 1
  }'
