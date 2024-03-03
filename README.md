# supabase-branch-gh-action

A Github Action to return the Supabase preview branch URL and credentials for a given Supabase project.

Find out more about Supabase Branching by reading the official docs [here](https://supabase.com/docs/guides/platform/branching).

This action is a wrapper around the [Supabase Management API](https://supabase.com/docs/guides/platform/branching#branching-api).

**Not officially endorsed by Supabase.**

## Usage

All outputs except api_url and graphql_url will be masked in the GitHub Actions logs.

Basic usage:

```yaml
- uses: 0xbigboss/supabase-branch-gh-action
  id: supabase-branch
  with:
    supabase-access-token: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    supabase-project-id: ${{ secrets.SUPABASE_PROJECT_ID }}
    wait-for-migrations: true # Optional. Default is false.
    timeout: 60 # Optional. Default is 60.
- name: Get result
  run: | 
    echo "ref:=${{steps.supabase-branch.outputs.ref:}}"
    echo "api_url:=${{steps.supabase-branch.outputs.api_url:}}"
    echo "graphql_url:=${{steps.supabase-branch.outputs.graphql_url:}}"
    echo "db_host:=${{steps.supabase-branch.outputs.db_host:}}"
    echo "db_port:=${{steps.supabase-branch.outputs.db_port:}}"
    echo "db_user:=${{steps.supabase-branch.outputs.db_user:}}"
    echo "db_password:=${{steps.supabase-branch.outputs.db_password:}}"
    echo "jwt_secret:=${{steps.supabase-branch.outputs.jwt_secret:}}"
```

## Contributing

To install dependencies:

```bash
bun install
```

Make some changes and then run:

```bash
bun run build
```

Commit the changes and push!

This project was created using `bun init` in bun v1.0.29. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
