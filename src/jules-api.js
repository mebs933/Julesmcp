import axios from 'axios';

const JULES_API_BASE_URL = process.env.JULES_API_BASE_URL || 'https://jules.googleapis.com/v1alpha';

export const createClient = (apiKey) => {
    return axios.create({
        baseURL: JULES_API_BASE_URL,
        headers: {
            'X-Goog-Api-Key': apiKey,
            'Content-Type': 'application/json',
        },
    });
};

export const listSources = async (client) => {
    const response = await client.get('/sources');
    return response.data;
};

export const getSource = async (client, sourceName) => {
    const response = await client.get(`/${encodeURIComponent(sourceName)}`);
    return response.data;
};

export const createSession = async (client, prompt, source, requirePlanApproval) => {
    const response = await client.post('/sessions', {
        prompt,
        sourceContext: {
            source,
            githubRepoContext: {
                startingBranch: 'main',
            },
        },
        automationMode: 'AUTO_CREATE_PR',
        ...(typeof requirePlanApproval === 'boolean' ? { requirePlanApproval } : {}),
    });
    return response.data;
};

export const listSessions = async (client) => {
    const response = await client.get('/sessions');
    return response.data;
};

export const getSession = async (client, sessionId) => {
    const response = await client.get(`/sessions/${encodeURIComponent(sessionId)}`);
    return response.data;
};

export const approvePlan = async (client, sessionId) => {
    const response = await client.post(`/sessions/${encodeURIComponent(sessionId)}:approvePlan`);
    return response.data;
};

export const listActivities = async (client, sessionId) => {
    const response = await client.get(`/sessions/${encodeURIComponent(sessionId)}/activities`);
    return response.data;
};

export const sendMessage = async (client, sessionId, prompt) => {
    const response = await client.post(`/sessions/${encodeURIComponent(sessionId)}:sendMessage`, {
        prompt,
    });
    return response.data;
};
