export class ZKTecoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ZKTecoConnectionError extends ZKTecoError {
    constructor(host: string, port: number, originalError?: string) {
        super(`Failed to connect to ${host}:${port}${originalError ? ` - ${originalError}` : ''}`);
    }
}

export class ZKTecoTimeoutError extends ZKTecoError {
    constructor(operation: string, timeoutMs: number) {
        super(`Operation '${operation}' timed out after ${timeoutMs}ms`);
    }
}

export class ZKTecoAuthenticationError extends ZKTecoError {
    constructor() {
        super("Authentication failed. Please check the communication password.");
    }
}
