export interface RequestRegisterUser {
    email: string,
    name: string
    password: string
}

export interface RequestLoginUser {
    email: string,
    password: string
}

export interface ResponseCreateUser {
    id: string,
    email: string,
    role_id: string
}

export interface ResponseLogin {
    access_token: string,
    refresh_token: string
}
