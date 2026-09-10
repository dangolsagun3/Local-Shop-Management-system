import { Request } from "express";

export interface IUserDetail {
    _id: string,
    name: string,
    email: string,
    role: string,
    emailVerified?: boolean,
    image?: {url: string, path: string} | null | string,
    address?: string | null,
    phone?: string | null,
    status: string
}

export interface IAuthRequest extends Request {
    loggedInUser?: IUserDetail | null
}