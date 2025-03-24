// src/figma-api-client.ts
import fetch from 'node-fetch';
import { Logger } from './server';

export class FigmaApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.figma.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    if (!this.apiKey) {
      throw new Error('Figma API key is required');
    }
  }

  private async request(method: string, endpoint: string, data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'X-Figma-Token': this.apiKey,
      'Content-Type': 'application/json'
    };
    
    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };
    
    try {
      Logger.log(`Figma API request: ${method} ${endpoint}`);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Figma API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      Logger.error('Figma API request failed:', error);
      throw error;
    }
  }

  // File operations
  async getFile(fileKey: string) {
    return this.request('GET', `/files/${fileKey}`);
  }

  async getFileNodes(fileKey: string, nodeIds: string[]) {
    const nodeIdsParam = nodeIds.join(',');
    return this.request('GET', `/files/${fileKey}/nodes?ids=${nodeIdsParam}`);
  }

  // Comments
  async getComments(fileKey: string) {
    return this.request('GET', `/files/${fileKey}/comments`);
  }

  async postComment(fileKey: string, message: string, position?: { x: number, y: number }) {
    return this.request('POST', `/files/${fileKey}/comments`, {
      message,
      ...(position && { client_meta: { x: position.x, y: position.y } })
    });
  }

  // Components and styles
  async getTeamComponents(teamId: string) {
    return this.request('GET', `/teams/${teamId}/components`);
  }

  async getTeamStyles(teamId: string) {
    return this.request('GET', `/teams/${teamId}/styles`);
  }

  // Projects
  async getTeamProjects(teamId: string) {
    return this.request('GET', `/teams/${teamId}/projects`);
  }

  async getProjectFiles(projectId: string) {
    return this.request('GET', `/projects/${projectId}/files`);
  }

  // Image export
  async exportImage(fileKey: string, nodeId: string, format: 'jpg' | 'png' | 'svg' | 'pdf' = 'png', scale: number = 1) {
    return this.request('GET', `/images/${fileKey}?ids=${nodeId}&format=${format}&scale=${scale}`);
  }
}