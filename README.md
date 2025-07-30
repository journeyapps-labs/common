# JourneyApps Labs Common

Common packages used in JourneyApps Labs repos.

## Release

### Dev release

1. Ensure a changeset has been created `pnpm changeset`
2. Run https://github.com/journeyapps-labs/common/actions/workflows/dev-packages.yaml the workflow manually on the branch you need

### Production release

1. Ensure a changeset has been created `pnpm changeset`
2. Merge PR and then merge the versions PR which gets created.