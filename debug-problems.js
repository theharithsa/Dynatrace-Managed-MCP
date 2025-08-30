const { DynatraceManagedClient } = require('./dist/authentication/dynatrace-managed-client.js');
require('dotenv').config();

async function debugProblems() {
  const client = new DynatraceManagedClient({
    url: process.env.DYNATRACE_URL,
    environmentId: process.env.DYNATRACE_ENVIRONMENT_ID,
    apiToken: process.env.DYNATRACE_API_TOKEN
  });

  try {
    const response = await client.get('/problems', {
      params: { 
        from: 'now-7d',
        pageSize: '2'
      }
    });

    console.log('Raw API response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.problems && response.data.problems.length > 0) {
      console.log('\nFirst problem rootCauseEntity:');
      console.log(response.data.problems[0].rootCauseEntity);
      console.log('Type:', typeof response.data.problems[0].rootCauseEntity);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugProblems();
