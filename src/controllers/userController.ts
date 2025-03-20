import { Request, Response } from "express";
import { Emitter } from "../index";

var users: User[] = []

export class User {
    public username: string | null = null
    public id: string | null = null

    constructor(username: string){
        this.username = username
    }

    logout() {
        users = users.filter(user_ => user_.username != this.username)

        this.username = null
    }
}

export async function login(request: Request, response: Response): Promise<void> { 
    const {username} = request.body

    const exists = users.find(user => user.username === username)

    if (exists){
        response.status(400).json({error: "Username already in use"})
        return
    }

    const user = new User(username)
    users.push(user)

    console.log("new user: ", JSON.stringify(user))

    Emitter.emit("new_user", user)

    response.status(200).json({ username })
    return
}

export async function listusers(request: Request, response: Response): Promise<void> {
    response.status(200).json({users})
    return
}