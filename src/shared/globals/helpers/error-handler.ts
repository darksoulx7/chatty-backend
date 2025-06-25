import HTTP_STATUS from 'http-status-codes';

// Shape of an error returned to the client
export interface IErrorResponse {
    message: string;
    statusCode: number;
    status: string;
    serializeErrors(): IError;
}

// Simple representation used inside CustomError classes
export interface IError {
    message: string;
    statusCode: number;
    status: string;
}

// Base class used to build application specific errors. Each error type
// specifies an HTTP status code and can be serialized for the client.
export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract status: string;

    constructor(message: string) {
        super(message);
    }

    serializeErrors(): IError {
        return {
            message: this.message,
            status: this.status,
            statusCode: this.statusCode,
        };
    }
}

// Thrown when a request fails Joi validation
export class JoiRequestValidationError extends CustomError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}
// General 400 error for invalid requests
export class BadRequestError extends CustomError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

// Used when a requested resource cannot be located
export class NotFound extends CustomError {
    statusCode = HTTP_STATUS.NOT_FOUND;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

// Indicates the user is not authenticated to perform the action
export class NotAuthorizedError extends CustomError {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

// Uploaded file exceeded allowed size limits
export class FileTooLargeError extends CustomError {
    statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

// Fallback for unexpected server side errors
export class ServerError extends CustomError {
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}
