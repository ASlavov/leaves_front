// server/sessionStore.ts
import {randomBytes} from 'crypto';


const sessionStore = new Map();  // Simple in-memory store (for demonstration)

// Function to create a session
export function createSession(userId: string, token: string) {
    const sessionId = generateSessionId();  // A function to generate unique session IDs
    sessionStore.set(sessionId, { userId, token });
    return sessionId;
}

// Function to get a session
export function getSession(sessionId: string) {
    //console.log(sessionId);
    return sessionStore.get(sessionId);
}

// Function to delete a session
export function deleteSession(sessionId: string) {
    sessionStore.delete(sessionId);
}

export function generateSessionId(): string {
    return randomBytes(32).toString('hex');  // Generates a 64-character hex string (256 bits of entropy)
}