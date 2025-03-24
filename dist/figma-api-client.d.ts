export declare class FigmaApiClient {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(apiKey: string);
    private request;
    getFile(fileKey: string): Promise<any>;
    getFileNodes(fileKey: string, nodeIds: string[]): Promise<any>;
    getComments(fileKey: string): Promise<any>;
    postComment(fileKey: string, message: string, position?: {
        x: number;
        y: number;
    }): Promise<any>;
    getTeamComponents(teamId: string): Promise<any>;
    getTeamStyles(teamId: string): Promise<any>;
    getTeamProjects(teamId: string): Promise<any>;
    getProjectFiles(projectId: string): Promise<any>;
    exportImage(fileKey: string, nodeId: string, format?: 'jpg' | 'png' | 'svg' | 'pdf', scale?: number): Promise<any>;
}
