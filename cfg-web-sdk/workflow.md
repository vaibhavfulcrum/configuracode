# SDK Git Workflow

## Live branch

Live is our main branch that represents the code that is considered current and stable. It should only contain reviewed and tested code that is guaranteed to compatible with our current live servers. This means no code should ever be pushed to live before it has been thoroughly tested and made sure to work with the live servers.

Merge requests targeting live is only allowed from release and patch branches.

We avoid using the word "master" for our main branch due to the negative connotations with the master/slave terminology.

## Release branch

Release branches represents a future Major or Minor release of the SDK. There is generally only one active release branch at a time, but exceptions can occur.

When the `live` is updated, all release branches should be rebased.

Merge requests from release branches have the target: Live branch.

Branch name: `release/X.Y.0`

### Patch branch

Patch branches contains a patch to the current SDK version.

Branch name: `release/X.Y.Z`

## Feature branch

A feature branch is a development branch which contains new features or fixes. In general, all feature branches should have a corresponding Jira ticket matching the branch name. Feature branches should be merged into the current release branch when done and tested. In the event that the intended release branch gets merged before the feature branch is merged to it, the feature branch should be rebased to target the next applicable release branch.

Branch name: `jira/wrd-[ID]`
