#!/bin/bash

# Exemple avec un autre modèle (un peu plus cher et avec plus d'options)

# POSITIONNER UNE VARIABLE SHELL $OPEN_API_KEY AVEC LA CLEF D'API OPENAI
# sous bash/mac/linux :
# export OPENAI_API_KEY=.....
#
# Sous windows/dos :
# set OPENAI_API_KEY=.....


curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "model": "gpt-3.5-turbo-0125",
  "messages": [
    {
      "role": "user",
      "content": "Propose un nom pour la MIAGE de Nice: "
    }
  ],
  "temperature": 1,
  "max_tokens": 7,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0
}'