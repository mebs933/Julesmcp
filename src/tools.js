import { UserError } from 'fastmcp';
import { z } from 'zod';
import * as julesApi from './jules-api.js';

const getClient = (context) => {
    if (!context || !context.session || !context.session.apiKey) {
        throw new UserError('Unauthorized: No API key provided in session context. Please provide a Bearer token in the Authorization header.');
    }
    return julesApi.createClient(context.session.apiKey);
};

// Higher-order function to handle errors
const withErrorHandling = (toolName, fn) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            if (error instanceof UserError) {
                // If it's already a UserError, just re-throw it as it's intended for the client
                throw error;
            }

            // Log the full error details on the server for debugging
            console.error(JSON.stringify({
                level: 'error',
                message: `Error in ${toolName}`,
                error: error.message,
                stack: error.stack,
            }));

            // Throw a generic error to the client to avoid leaking sensitive details
            throw new UserError(`An internal error occurred while executing ${toolName}. Please check server logs for details.`);
        }
    };
};

export const addTools = (server) => {
    server.addTool({
        name: 'list_sources',
        description: 'List available sources',
        parameters: z.object({}),
        execute: withErrorHandling('list_sources', async (args, context) => {
            const client = getClient(context);
            const sources = await julesApi.listSources(client);
            return sources;
        }),
    });
    server.addTool({
        name: 'get_source',
        description: 'Get a source by name',
        parameters: z.object({
            sourceName: z.string(),
        }),
        execute: withErrorHandling('get_source', async ({ sourceName }, context) => {
            const client = getClient(context);
            const source = await julesApi.getSource(client, sourceName);
            return source;
        }),
    });
    server.addTool({
        name: 'get_session',
        description: 'Get a session by ID',
        parameters: z.object({
            sessionId: z.string(),
        }),
        execute: withErrorHandling('get_session', async ({ sessionId }, context) => {
            const client = getClient(context);
            const session = await julesApi.getSession(client, sessionId);
            return session;
        }),
    });
    server.addTool({
        name: 'create_session',
        description: 'Create a new session',
        parameters: z.object({
            prompt: z.string(),
            source: z.string(),
            requirePlanApproval: z.boolean().optional(),
        }),
        execute: withErrorHandling('create_session', async ({ prompt, source, requirePlanApproval }, context) => {
            const client = getClient(context);
            const session = await julesApi.createSession(client, prompt, source, requirePlanApproval);
            return session;
        }),
    });
    server.addTool({
        name: 'list_sessions',
        description: 'List all sessions',
        parameters: z.object({}),
        execute: withErrorHandling('list_sessions', async (args, context) => {
            const client = getClient(context);
            const sessions = await julesApi.listSessions(client);
            return sessions;
        }),
    });
    server.addTool({
        name: 'approve_plan',
        description: "Approve a session's plan",
        parameters: z.object({
            sessionId: z.string(),
        }),
        execute: withErrorHandling('approve_plan', async ({ sessionId }, context) => {
            const client = getClient(context);
            const result = await julesApi.approvePlan(client, sessionId);
            return result;
        }),
    });
    server.addTool({
        name: 'list_activities',
        description: 'List all activities in a session',
        parameters: z.object({
            sessionId: z.string(),
        }),
        execute: withErrorHandling('list_activities', async ({ sessionId }, context) => {
            const client = getClient(context);
            const activities = await julesApi.listActivities(client, sessionId);
            return activities;
        }),
    });
    server.addTool({
        name: 'send_message',
        description: 'Send a message to the agent in a session',
        parameters: z.object({
            sessionId: z.string(),
            prompt: z.string(),
        }),
        execute: withErrorHandling('send_message', async ({ sessionId, prompt }, context) => {
            const client = getClient(context);
            const result = await julesApi.sendMessage(client, sessionId, prompt);
            return result;
        }),
    });
};
