#!/bin/bash

npx del packages/example-app/dist/
npx del packages/babylon-view-react/dist/
npx del packages/babylon-view/dist/
npx del packages/web-api-auth/dist/
npx del packages/web-api/dist/
npx del packages/web-core/dist/
npx del packages/web-ui/dist/

lerna clean --yes && lerna bootstrap

lerna run build --stream
