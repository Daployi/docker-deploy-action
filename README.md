# Daployi Docker Compose Deploy

Deploy Docker Compose stacks to the Daployi platform from GitHub Actions.

## Usage

```yaml
- name: Deploy to Daployi
  uses: daployi/docker-deploy-action@v1
  with:
    api_token: ${{ secrets.DAPLOYI_TOKEN }}
    variables: '{"IMAGE_TAG": "v1.2.3"}'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `api_token` | Your Daployi API token | Yes      | - |
| `variables` | JSON string of variables to override | No       | `{}` |
| `api_url` | The base URL of the Daployi instance | Yes      | - |

## Outputs

| Output | Description |
|--------|-------------|
| `uuid` | The unique identifier for the deployment batch |

## License

MIT
