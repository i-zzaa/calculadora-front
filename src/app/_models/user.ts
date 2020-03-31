export interface User {
    id?: number;
    username: string;
    password?: string;
    profile: string;
    status: string;
    createdDate?: Date;
}

export interface LoginResponse {
    user: User;
    token: string;
    data: any;
    message: string;
}