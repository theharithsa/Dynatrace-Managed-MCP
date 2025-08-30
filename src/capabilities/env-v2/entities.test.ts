import { handleListEntities } from './list-entities';
import { handleGetEntity } from './get-entity';
import { handleCreateCustomDevice } from './create-custom-device';
import { handleListEntityTypes } from './list-entity-types';
import { handleGetEntityType } from './get-entity-type';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';

// Mock the client
jest.mock('../../authentication/dynatrace-managed-client');

describe('Monitored Entities Tools', () => {
  let mockClient: jest.Mocked<DynatraceManagedClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
    } as any;
  });

  const createMockAxiosResponse = (data: any) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {
      headers: {}
    } as any
  });

  describe('List Entities', () => {
    it('should handle list entities request', async () => {
      const mockResponseData = {
        entities: [],
        totalCount: 0,
        pageSize: 50
      };

      mockClient.get.mockResolvedValue(createMockAxiosResponse(mockResponseData));

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'list_entities',
          arguments: {
            entitySelector: 'type("HOST")',
            pageSize: 50
          }
        }
      };

      const result = await handleListEntities(request, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/entities?entitySelector=type%28%22HOST%22%29&pageSize=50');
      expect(result.content[0].text).toContain('Monitored Entities');
    });

    it('should handle list entities error', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'));

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'list_entities',
          arguments: {}
        }
      };

      const result = await handleListEntities(request, mockClient);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Entities List Error');
    });
  });

  describe('Get Entity', () => {
    it('should handle get entity request', async () => {
      const mockResponseData = {
        entityId: 'HOST-1234567890ABCDEF',
        displayName: 'test-host-01',
        type: 'HOST'
      };

      mockClient.get.mockResolvedValue(createMockAxiosResponse(mockResponseData));

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'get_entity',
          arguments: {
            entityId: 'HOST-1234567890ABCDEF'
          }
        }
      };

      const result = await handleGetEntity(request, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/entities/HOST-1234567890ABCDEF');
      expect(result.content[0].text).toContain('Entity Details');
    });

    it('should handle missing entity ID', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'get_entity',
          arguments: {}
        }
      };

      const result = await handleGetEntity(request, mockClient);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('entityId parameter is required');
    });
  });

  describe('Create Custom Device', () => {
    it('should handle create custom device request', async () => {
      const mockResponseData = {
        entityId: 'CUSTOM_DEVICE-1234567890ABCDEF',
        groupId: 'GROUP-123'
      };

      mockClient.post.mockResolvedValue(createMockAxiosResponse(mockResponseData));

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'create_custom_device',
          arguments: {
            customDeviceId: 'my-custom-device',
            displayName: 'My Custom Device'
          }
        }
      };

      const result = await handleCreateCustomDevice(request, mockClient);

      expect(mockClient.post).toHaveBeenCalledWith('/entities/custom', expect.objectContaining({
        customDeviceId: 'my-custom-device',
        displayName: 'My Custom Device'
      }));
      expect(result.content[0].text).toContain('Custom Device Created Successfully');
    });

    it('should handle missing required parameters', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'create_custom_device',
          arguments: {}
        }
      };

      const result = await handleCreateCustomDevice(request, mockClient);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('customDeviceId and displayName are required');
    });
  });

  describe('List Entity Types', () => {
    it('should handle list entity types request', async () => {
      const mockResponseData = {
        types: [],
        totalCount: 0,
        pageSize: 200
      };

      mockClient.get.mockResolvedValue(createMockAxiosResponse(mockResponseData));

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'list_entity_types',
          arguments: {}
        }
      };

      const result = await handleListEntityTypes(request, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/entityTypes');
      expect(result.content[0].text).toContain('Entity Types');
    });
  });

  describe('Get Entity Type', () => {
    it('should handle get entity type request', async () => {
      const mockResponseData = {
        type: 'HOST',
        entityLimitExceeded: 'false',
        managementZones: 'supported',
        tags: 'supported'
      };

      mockClient.get.mockResolvedValue(createMockAxiosResponse(mockResponseData));

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'get_entity_type',
          arguments: {
            type: 'HOST'
          }
        }
      };

      const result = await handleGetEntityType(request, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/entityTypes/HOST');
      expect(result.content[0].text).toContain('Entity Type Details');
    });

    it('should handle missing type parameter', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'get_entity_type',
          arguments: {}
        }
      };

      const result = await handleGetEntityType(request, mockClient);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('type parameter is required');
    });
  });

  describe('Parameter Handling', () => {
    it('should handle MCP parameter structure correctly', async () => {
      const mockResponseData = {
        entities: [],
        totalCount: 0,
        pageSize: 50
      };

      mockClient.get.mockResolvedValue(createMockAxiosResponse(mockResponseData));

      // Test both parameter structures that MCP might send
      const request1: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'list_entities',
          arguments: {
            entitySelector: 'type("HOST")'
          }
        }
      };

      const request2: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'list_entities',
          entitySelector: 'type("HOST")'
        } as any
      };

      await handleListEntities(request1, mockClient);
      await handleListEntities(request2, mockClient);

      expect(mockClient.get).toHaveBeenCalledTimes(2);
      expect(mockClient.get).toHaveBeenCalledWith('/entities?entitySelector=type%28%22HOST%22%29');
    });
  });
});
