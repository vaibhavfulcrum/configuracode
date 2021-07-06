# Configura Web SDK

## Documentation
We have [published the documentation for the SDK](docs.configuracloud.com) but also our API.

If you want to run the documentation locally you can add `--scope='@configura/web-sdk-docs'` to the `lerna run start` command

## Running the example code

1. Clone this repo.
2. Install Node.js (https://nodejs.org/en/download/package-manager/).
    - Recommended version is 12 or later but minimum version is v10
3. Install Yarn (https://yarnpkg.com/lang/en/docs/install).
    - Don't forget to do the "Path Setup" part if you are on Linux / macOS.
4. Install Lerna.
    ```sh
    yarn global add lerna
    ```
5. Install dependencies.
    ```sh
    lerna bootstrap
    ```
    Please note that if you pulling down new changes you might need to clean first by running this command:
    ```sh
    lerna clean --yes && lerna bootstrap
    ```
6. Build SDK modules
    ```sh
    lerna run build --stream --ignore='@configura/web-sdk-docs' --ignore='@configura/example-*' --ignore='@configura/test-app'
    ```
7. Start example app and example server.
    ```sh
    CATALOGUE_API_ACCESS_TOKEN="Your AccessToken here" lerna run start --stream --parallel --scope='@configura/example-app'  --scope='@configura/example-server'
    ```

## Running test app
We have developed a test tool where you can step through all products in your catalogues. To run the test app add `--scope='@configura/test-app'` to the `lerna run start` command

## Adding SDK modules to a _client_ project.

```sh
yarn add @configura/internal @configura/babylon-view @configura/babylon-view-react @configura/web-api @configura/web-core @configura/web-ui
```

## Adding SDK modules to a _server_ project.

```sh
yarn add @configura/web-api-auth
```

## React-router history workaround

React-router has a long standing bug in its History module related to handling URLs that contain special characters like '/' (encoded as "%2f") and '%'. This can affect URLs which contains any parameter (catalogue, vendor, price list, product number, etc) that contains such special characters in unexpected ways.

A fix has been made but the maintainers decided to not ship it until version 5.0.0 of the History module. More specifically they explicitly removed the fix from the 4.x branch the same day that version 4.10.0 was released.

Until then we need to force version to 4.5.1 in the package.json file since this was the last working version. There is also a possible workaround using "patch packages" if version 4.5.1 is not viable, see comments on issue 505 referenced below.

### References

<https://github.com/ReactTraining/history/issues/745>
<https://github.com/ReactTraining/history/pull/656>
<https://github.com/ReactTraining/history/issues/505>
