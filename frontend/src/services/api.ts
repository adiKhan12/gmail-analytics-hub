import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface EmailStats {
    overview: {
        total_emails: number;
        unread_emails: number;
        analyzed_emails: number;
        last_sync: string;
    };
    categories: {
        [key: string]: number;
    };
    priorities: {
        [key: string]: number;
    };
    sentiments: {
        [key: string]: number;
    };
    high_priority: Array<{
        id: string;
        subject: string;
        sender: string;
        priority_score: number;
    }>;
    pending_actions: Array<{
        id: string;
        subject: string;
        action_items: string;
    }>;
}

export interface TimelineData {
    timeline: Array<{
        date: string;
        count: number;
    }>;
}

export async function getDashboardStats(): Promise<EmailStats> {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

export const getEmailTimeline = async (days: number = 7): Promise<TimelineData> => {
    const response = await api.get(`/dashboard/timeline?days=${days}`);
    return response.data;
};

export async function syncEmails(limit: number = 50): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/emails/sync?limit=${limit}`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error syncing emails:', error);
        throw error;
    }
}

export async function analyzeEmails(limit: number = 50): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/emails/analyze?limit=${limit}`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error analyzing emails:', error);
        throw error;
    }
} 