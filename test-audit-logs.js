#!/usr/bin/env node

/**
 * Test script for audit log capabilities
 */

import { DynatraceManagedClient } from '../src/authentication/dynatrace-managed-client.js';
import { getDynatraceManagedConfig } from '../src/utils/config.js';
import { getUserAgent } from '../src/utils/user-agent.js';
import { handleListAuditLogs } from '../src/capabilities/env-v2/list-audit-logs.js';
import { handleGetAuditLog } from '../src/capabilities/env-v2/get-audit-log.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAuditLogs() {
  try {
    console.log('🧪 Testing Audit Log Capabilities...\n');

    // Initialize client
    const config = getDynatraceManagedConfig();
    const userAgent = getUserAgent();
    const client = new DynatraceManagedClient({ config, userAgent });

    // Test connection
    console.log('📡 Testing connection...');
    const isConnected = await client.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Dynatrace');
    }
    console.log('✅ Connection successful\n');

    // Test list audit logs
    console.log('📋 Testing list audit logs...');
    const listRequest = {
      method: 'tools/call',
      params: {
        name: 'list_audit_logs',
        arguments: {
          pageSize: 3,
          from: 'now-1w'
        }
      }
    };

    const listResult = await handleListAuditLogs(listRequest as any, client);
    console.log('✅ List audit logs successful');
    console.log(listResult.content[0].text.substring(0, 200) + '...\n');

    // Extract a log ID from the result to test get audit log
    const logIdMatch = listResult.content[0].text.match(/\*\*Log ID:\*\* (\d+)/);
    if (logIdMatch) {
      const logId = logIdMatch[1];
      console.log(`🔍 Testing get audit log with ID: ${logId}...`);
      
      const getRequest = {
        method: 'tools/call',
        params: {
          name: 'get_audit_log',
          arguments: {
            id: logId
          }
        }
      };

      const getResult = await handleGetAuditLog(getRequest as any, client);
      console.log('✅ Get audit log successful');
      console.log(getResult.content[0].text.substring(0, 200) + '...\n');
    }

    console.log('🎉 All audit log tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAuditLogs();
