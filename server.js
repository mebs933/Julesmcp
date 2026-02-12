import { FastMCP } from 'fastmcp';
import { addTools } from './src/tools.js';

const server = new FastMCP({
    name: 'google-jules-mcp-sse',
    version: '1.0.0',
    authenticate: async (request) => {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            // Return null if no header. Tools will check for this.
            return { apiKey: null };
        }

        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (!match) {
            return { apiKey: null };
        }

        return { apiKey: match[1] };
    }
});

addTools(server);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.start({
    transportType: 'httpStream',
    httpStream: {
        port: port,
        endpoint: '/sse',
    }
});

console.log(`Server started on port ${port}`);
