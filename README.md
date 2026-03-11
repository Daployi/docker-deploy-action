# Daployi Docker Compose Deploy

## Description

[Daployi](https://daployi.com) is a unified container management platform built for Docker-based edge device fleets and server environments – enabling scalable deployments, full audit trails, and instant rollbacks. It simplifies operations, reduces errors and overhead, and provides complete visibility through a single secure system.



### Links

- [Official Website](https://daployi.com)
- [Documentation](https://docs.daployi.com)
- [GitHub Issues](https://github.com/Daployi/daployi-issues)

Deploy Docker Compose stacks to the Daployi platform from GitHub Actions. Daployi allows you to deploy Docker containers to your fleet of devices in a single click

## Usage

```yaml
- name: Deploy to Daployi
  uses: daployi/docker-deploy-action@v1
  with:
    api_url: https://api.daployi.yourdomain.com
    api_token: ${{ secrets.DAPLOYI_TOKEN }}
    variables: '{"IMAGE_TAG": "v1.2.3"}'
    timeout: 60
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `api_token` | Your Daployi API token | Yes      | - |
| `api_url` | The base URL of the Daployi instance | Yes      | - |
| `variables` | JSON string of variables to override | No       | `{}` |
| `timeout` | Timeout in minutes for waiting for the deployment to finish | No | `60` |

## How it works

1. **Triggering**: The action sends a POST request to the Daployi API to trigger the deployment.
2. **Polling**: The action polls the Daployi API every 15 seconds to check the status of the deployment.
3. **Completion**: The action completes successfully when the deployment state is `success` or `completed` and the `complete` field is `true`.
4. **Failure**: If the deployment fails on any device, the action will log the errors and fail.
5. **Timeout**: If the deployment takes longer than the specified `timeout` (default 60 minutes), the action will fail.

## Outputs

| Output | Description |
|--------|-------------|
| `uuid` | The unique identifier for the deployment batch |

## License

MIT
