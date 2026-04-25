export interface RequestRegisterUser {
    email: string,
    name: string
    password: string
}

export interface ResponseCreateUser {
    id: string,
    email: string,
    role_id: string
}