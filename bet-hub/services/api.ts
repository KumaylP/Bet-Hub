
// Dynamic API URL - works from localhost or network
const API_URL = `http://${window.location.hostname}:8000`;

export interface ApiResponse<T> {
    error?: string;
    data?: T;
    // Some endpoints return the data directly, others wrap it.
    // We'll normalize this in the service.
}

export const api = {
    // Auth
    login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return res.json();
    },

    register: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        return res.json();
    },

    getUser: async (email: string) => {
        const res = await fetch(`${API_URL}/user/${email}`);
        return res.json();
    },

    // Bets
    getBets: async () => {
        const res = await fetch(`${API_URL}/bets`);
        return res.json();
    },

    getBetsForUser: async (email: string) => {
        const res = await fetch(`${API_URL}/user/${email}/bets`);
        return res.json();
    },

    getBet: async (id: string) => {
        const res = await fetch(`${API_URL}/bet/${id}`);
        return res.json();
    },

    createBet: async (data: any) => {
        const res = await fetch(`${API_URL}/create-bet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    joinBet: async (data: any) => {
        const res = await fetch(`${API_URL}/join-bet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    joinPrivateBet: async (data: any) => {
        const res = await fetch(`${API_URL}/join-bet-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Loan System
    applyLoan: async (email: string, amount: number) => {
        const res = await fetch(`${API_URL}/user/loan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, amount }),
        });
        return res.json();
    },

    repayLoan: async (email: string, amount: number) => {
        const res = await fetch(`${API_URL}/user/repay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, amount }),
        });
        return res.json();
    },

    // Bet Management & Resolution
    declareResult: async (email: string, bet_id: string, result: string) => {
        const res = await fetch(`${API_URL}/declare-result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, bet_id, result }),
        });
        return res.json();
    },

    closeBet: async (email: string, bet_id: string) => {
        const res = await fetch(`${API_URL}/close-bet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, bet_id }),
        });
        return res.json();
    },

    addComment: async (email: string, betId: string, text: string) => {
        const res = await fetch(`${API_URL}/bets/${betId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, text })
        });
        return res.json();
    },

    likeComment: async (email: string, betId: string, commentId: string) => {
        const res = await fetch(`${API_URL}/bets/${betId}/comments/${commentId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return res.json();
    },

    // Additional endpoints
    getTransactions: async (email: string) => {
        const res = await fetch(`${API_URL}/user/${email}/transactions`);
        return res.json();
    },

    getBetByCode: async (bet_code: string) => {
        const res = await fetch(`${API_URL}/bet-by-code/${bet_code}`);
        return res.json();
    }
};
