"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigmaApiClient = void 0;
// src/figma-api-client.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
const server_1 = require("./server");
class FigmaApiClient {
    constructor(apiKey) {
        this.baseUrl = 'https://api.figma.com/v1';
        this.apiKey = apiKey;
        if (!this.apiKey) {
            throw new Error('Figma API key is required');
        }
    }
    async request(method, endpoint, data) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'X-Figma-Token': this.apiKey,
            'Content-Type': 'application/json'
        };
        const options = {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
        };
        try {
            server_1.Logger.log(`Figma API request: ${method} ${endpoint}`);
            const response = await (0, node_fetch_1.default)(url, options);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Figma API error (${response.status}): ${errorText}`);
            }
            return await response.json();
        }
        catch (error) {
            server_1.Logger.error('Figma API request failed:', error);
            throw error;
        }
    }
    // File operations
    async getFile(fileKey) {
        return this.request('GET', `/files/${fileKey}`);
    }
    async getFileNodes(fileKey, nodeIds) {
        const nodeIdsParam = nodeIds.join(',');
        return this.request('GET', `/files/${fileKey}/nodes?ids=${nodeIdsParam}`);
    }
    // Comments
    async getComments(fileKey) {
        return this.request('GET', `/files/${fileKey}/comments`);
    }
    async postComment(fileKey, message, position) {
        return this.request('POST', `/files/${fileKey}/comments`, {
            message,
            ...(position && { client_meta: { x: position.x, y: position.y } })
        });
    }
    // Components and styles
    async getTeamComponents(teamId) {
        return this.request('GET', `/teams/${teamId}/components`);
    }
    async getTeamStyles(teamId) {
        return this.request('GET', `/teams/${teamId}/styles`);
    }
    // Projects
    async getTeamProjects(teamId) {
        return this.request('GET', `/teams/${teamId}/projects`);
    }
    async getProjectFiles(projectId) {
        return this.request('GET', `/projects/${projectId}/files`);
    }
    // Image export
    async exportImage(fileKey, nodeId, format = 'png', scale = 1) {
        return this.request('GET', `/images/${fileKey}?ids=${nodeId}&format=${format}&scale=${scale}`);
    }
}
exports.FigmaApiClient = FigmaApiClient;
//# sourceMappingURL=figma-api-client.js.map