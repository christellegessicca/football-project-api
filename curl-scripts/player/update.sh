#!/bin/bash

API="http://localhost:4741"
URL_PATH="/players"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
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
