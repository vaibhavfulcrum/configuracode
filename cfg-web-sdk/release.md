# SDK Release Workflow

## npm

In order to be able to publish packages on NPM you'll first need to create an account on the [official npm website](https://www.npmjs.com/). When your account is setup reach out to Henrik Sjööh (Owner) to be given access to the Configura organisation. Once you have been given access you now have the abiltiy to publish the SDK packages to npm.

## Preparation

There are a few important steps that should always be done before attempting to build and publish a new set of npm packages.

1. Run `npm whoami` to make sure you are logged in.
2. Checkout the branch you want to build the packages from. This will most likely be a release-branch e.g. `release/0.2.0`
3. Run `lerna clean --yes && lerna bootstrap && lerna run build --stream --ignore='@configura/test-app' --ignore='@configura/example-*' && lerna run start --stream --parallel`
    1. This will clean, bootstrap, build and then start everything. Always to do as a precaution to make sure everything works as intended.
4. **Important** Check if there any uncommitted changes in your local environment. Running the `publish` command will automatically commit and push **all** changes when pushing the new tags.

## Publish

Once the preparation steps have been made (if you haven't, do it!) it's now time to publish a new version of the packages. There are two types of packages we publish: Stable and Alpha. Where stable releases are the ones we recommend our customers to use that have been throughly tested. Alpha releases are pre-releases that are more experimental.

Last warning: Make sure everything is OK before publishing because there’s no rollback!

### Stable

Run the command: `lerna publish --force-publish` and follow the interactive guide. For stable releases it should always be either Major, Minor or Patch that is selected for the version.

The publish command will only bump versions of packages it can detect changes to since the last release but we want all packages to have the _same version_. To overcome that we use `—force-publish` which forces a new version of all packages even if no changes have been made.

### Alpha

Run the command: `lerna publish --force-publish --dist-tag next` and follow the interactive guide. For alpha release it should always be a pre-release meaning either Premajor, Preminor, Prepatch or Custom Prerelease.

If an alpha has been publish e.g. 0.2.0-alpha.1 and you want to bump to 0.2.0-alpha.2 you need to select the `Custom Prerelease` when choosing version options.

By default the `dist-tag` will be `latest` and that will be the packages a users receives when installing the first time or upgrading to the latest version. However, this is not desirable when dealing with an alpha build which is why we need to manually tag it as `next`. With that a user can install it with @configura/[PACKAGE]@next.
