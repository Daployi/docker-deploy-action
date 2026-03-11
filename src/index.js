const core = require('@actions/core');
const axios = require('axios');

async function run() {
  try {
    const apiToken = core.getInput('api_token', { required: true });
    const variablesInput = core.getInput('variables');
    let apiUrl = core.getInput('api_url', { required: true });
    const timeoutMinutes = parseInt(core.getInput('timeout') || '60', 10);
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const startTime = Date.now();

    // Remove trailing slash from apiUrl if present
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }

    let variables = {};
    if (variablesInput) {
      try {
        variables = JSON.parse(variablesInput);
      } catch (error) {
        core.setFailed(`Failed to parse variables JSON: ${error.message}`);
        return;
      }
    }

    core.info('Triggering Daployi action...');
    
    const triggerUrl = `${apiUrl}/api/actions/execute/${apiToken}`;
    const triggerResponse = await axios.post(triggerUrl, { variables });

    const { uuid, message } = triggerResponse.data;
    core.info(`${message || 'Deployment scheduled'}. UUID: ${uuid}`);
    core.setOutput('uuid', uuid);

    if (!uuid) {
      core.setFailed('No UUID returned from Daployi API.');
      return;
    }

    core.info('Tracking deployment status...');
    const statusUrl = `${apiUrl}/api/actions/status/${apiToken}`;

    while (true) {
      const statusResponse = await axios.get(statusUrl, { params: { uuid } });
      const status = statusResponse.data;
      const { state, overallProgress, actionName, complete } = status;

      core.debug(`Full status response: ${JSON.stringify(status)}`);
      core.info(`Action: ${actionName} | Status: ${state} (${overallProgress}%)`);

      if ((state === 'success' || state === 'completed') && complete === true) {
        core.info('✅ Deployment Successful!');
        break;
      }

      if (state === 'failed') {
        core.error('❌ Deployment Failed!');
        
        if (status.devices) {
          for (const [deviceUuid, deviceData] of Object.entries(status.devices)) {
            if (deviceData.state === 'failed') {
              core.error(`Device ${deviceUuid} failed: ${deviceData.error || 'Unknown error'}`);
              if (deviceData.events) {
                deviceData.events.forEach(event => {
                  if (event.state === 'failed') {
                    core.error(`  - Event ${event.name} (${event.action}) failed: ${event.error}`);
                  }
                });
              }
            }
          }
        }
        
        core.setFailed('Daployi deployment failed.');
        break;
      }

      if (Date.now() - startTime > timeoutMs) {
        core.setFailed(`Deployment timed out after ${timeoutMinutes} minutes.`);
        break;
      }

      // Wait for 15 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  } catch (error) {
    if (error.response) {
      core.setFailed(`Daployi API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      core.setFailed(`Action failed with error: ${error.message}`);
    }
  }
}

run();
