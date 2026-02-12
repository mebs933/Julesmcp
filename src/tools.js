import { UserError } from 'fastmcp';
import { z } from 'zod';
import * as julesApi from './jules-api.js';

const getClient = (context) => {
    if (!context || !context.session || !context.session.apiKey) {
        throw new UserError('Unauthorized: No API key provided in session context. Please provide a Bearer token in the Authorization header.');
    }
    return julesApi.createClient(context.session.apiKey);
};

export const addTools = (server) => {
    server.addTool({
        name: 'list_sources',
        description: 'List available sources',
        parameters: z.object({}),
        execute: async (args, context) => {
            try {
                const client = getClient(context);
                const sources = await julesApi.listSources(client);
                return JSON.stringify(sources, null, 2);
            }
            catch (error) {
                throw new UserError(`Error listing sources: ${error.message}`);
            }
        },
    });
    server.addTool({
        name: 'get_source',
        description: 'Get a source by name',
        parameters: z.object({
            sourceName: z.string(),
        }),
        execute: async ({ sourceName }, context) => {
            try {
                const client = getClient(context);
                const source = await julesApi.getSource(client, sourceName);
                return JSON.stringify(source, null, 2);
            }
            catch (error) {
                throw new UserError(`Error getting source: ${error.message}`);
            }
        },
    });
    server.addTool({
        name: 'get_session',
        description: 'Get a session by ID',
        parameters: z.object({
            sessionId: z.string(),
        }),
        execute: async ({ sessionId }, context) => {
            try {
                const client = getClient(context);
                const session = await julesApi.getSession(client, sessionId);
                return JSON.stringify(session, null, 2);
            }
            catch (error) {
                throw new UserError(`Error getting session: ${error.message}`);
            }
        },
    });
    server.addTool({
        name: 'create_session',
        description: 'Create a new session',
        parameters: z.object({
            prompt: z.string(),
            source: z.string(),
            requirePlanApproval: z.boolean().optional(),
        }),
        execute: async ({ prompt, source, requirePlanApproval }, context) => {
            try {
                const client = getClient(context);
                const session = await julesApi.createSession(client, prompt, source, requirePlanApproval);
                return JSON.stringify(session, null, 2);
            }
            catch (error) {
                throw new UserError(`Error creating session: ${error.message}`);
            }
        },
    });
    server.addTool({
        name: 'list_sessions',
        description: 'List all sessions',
        parameters: z.object({}),
        execute: async (args, context) => {
            try {
                const client = getClient(context);
                const sessions = await julesApi.listSessions(client);
                return JSON.stringify(sessions, null, 2);
            }
            catch (error) {
                throw new UserError(`Error listing sessions: ${error.message}`);
            }
        },
    });
    server.addTool({
        name: 'approve_plan',
        description: "Approve a session's plan",
        parameters: z.object({
            sessionId: z.string(),
        }),
        execute: async ({ sessionId }, context) => {
            try {
                const client = getClient(context);
                const result = await julesApi.approvePlan(client, sessionId);
                return JSON.stringify(result, null, 2);
            }
            catch (error) {
                throw new UserError(`Error approving plan: ${error.message}`);
            }
        },
    });
    server.addTool({
        name: 'list_activities',
        description: 'List all activities in a session',
        parameters: z.object({
            sessionId: z.string(),
        }),
        execute: async ({ sessionId }, context) => {
            try {
                const client = getClient(context);
                const activities = await julesApi.listActivities(client, sessionId);
                return JSON.stringify(activities, null, 2);
            }
            catch (error) {
                throw new UserError(`Error listing activities: ${error.message}`);
            }
        },
    });
    server.addTool({
        name: 'send_message',
        description: 'Send a message to the agent in a session',
        parameters: z.object({
            sessionId: z.string(),
            prompt: z.string(),
        }),
        execute: async ({ sessionId, prompt }, context) => {
            try {
                const client = getClient(context);
                const result = await julesApi.sendMessage(client, sessionId, prompt);
                return JSON.stringify(result, null, 2);
            }
            catch (error) {
                throw new UserError(`Error sending message: ${error.message}`);
            }
        },
    });
};
