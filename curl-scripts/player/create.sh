#!/bin/bash

API="http://localhost:4741"
URL_PATH="/players"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "player": {
      "playerName": "'"${PLAYERNAME}"'",
      "team": "'"${TEAM}"'",
      "position": "'"${POSITION}"'"
    }
  }'

echo
#
