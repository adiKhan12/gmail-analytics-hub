import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
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

export interface Email {
    id: string;
    subject: string;
    sender: string;
    recipient?: string;
    body_text?: string;
    body_html?: string;
    snippet: string;
    is_read: boolean;
    is_important: boolean;
    category: string;
    priority_score: number;
    sentiment: string;
    action_items: string[];
    summary?: string;
    created_at: string;
}

export interface EmailListResponse {
    emails: Email[];
    total: number;
}

export interface SearchFilters {
    search?: string;
    category?: string;
    min_priority?: number;
    sender?: string;
    has_action_items?: boolean;
    skip?: number;
    limit?: number;
}

export interface DraftRequest {
    email_id: string;
    mode: 'reply' | 'forward';
    instructions?: string;
}

export interface DraftResponse {
    success: boolean;
    draft?: string;
    error?: string;
}

export async function getDashboardStats(): Promise<EmailStats> {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            credentials: 'include',
        });
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
            credentials: 'include',
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
            credentials: 'include',
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

export async function listEmails(filters: SearchFilters): Promise<EmailListResponse> {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.min_priority) params.append('min_priority', filters.min_priority.toString());
        if (filters.sender) params.append('sender', filters.sender);
        if (filters.has_action_items !== undefined) params.append('has_action_items', filters.has_action_items.toString());
        if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
        if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
        
        const response = await fetch(`${API_BASE_URL}/emails/list?${params.toString()}`, {
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            emails: data.emails.map((email: any) => ({
                ...email,
                action_items: email.action_items || []
            })),
            total: data.total
        };
    } catch (error) {
        console.error('Error fetching emails:', error);
        throw error;
    }
}

export async function generateEmailDraft(request: DraftRequest): Promise<DraftResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/drafts/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(request),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error generating email draft:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function markEmailAsRead(emailId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/emails/${emailId}/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error marking email as read:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function toggleEmailImportance(emailId: string, isImportant: boolean): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/emails/${emailId}/toggle-important?is_important=${isImportant}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error toggling email importance:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function deleteEmail(emailId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
} 