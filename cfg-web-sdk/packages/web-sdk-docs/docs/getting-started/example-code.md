---
id: example-code
title: Example code
sidebar_label: Example code
---

import {PkgExampleApp, PkgExampleServer} from "../packageOverview/package-overview.tsx";
import {AccessToken} from "../vocabulary/vocabulary.tsx";

To quickly get things started we have created an <PkgExampleApp /> and <PkgExampleServer />. This will allow you to browse, view and configure your catalogue data.

## Prerequisite

First, let’s make sure that your development environment is ready.

-   Make sure you have [Node.js installed](https://nodejs.org/en/download/package-manager/)
    -   You’ll need Node.js version 10.X or later.
-   Make sure you have [Yarn installed](https://yarnpkg.com/getting-started/install).
    -   Don't forget to do the "Path Setup" part if you are on Linux / macOS.

To manage our packages we use [Lerna](https://lerna.js.org/), which is a tool that optimizes the workflow around managing multi-package repositories with git and npm.

```sh
yarn global add lerna
```

The code for our Example App and Example Server is hosted in a GitLab repository, so you'll need to clone it. Please note that this is private repository and is invite only.

```sh
git clone git@git.configura.com:web/rnd/cfg-web-sdk.git
cd cfg-web-sdk
```

Before starting the app you'll need to install all dependencies and build our packages.

```sh
lerna bootstrap
lerna run build --stream --ignore='@configura/web-sdk-docs' --ignore='@configura/example-*' --ignore='@configura/test-app'
```

## Get started

Now it's time to start our Example App and Example Server. When running this command you'll need to provide your <AccessToken /> to be able to access your catalogue data. The AccessToken is something that is obtained when signing up for the service.

```sh
CATALOGUE_API_ACCESS_TOKEN="Your AccessToken here" lerna run start --stream --parallel --scope= @configura/example-app  --scope= @configura/example-server
```

## Running test app
We have developed a test tool where you can step through all products in your catalogues. To run the test app add `--scope @configura/test-app` to the `lerna run start` command

## Running documentation locally
If you want to run this documentation locally you can do so by adding `--scope @configura/web-sdk-docs` to the `lerna run start` command.
