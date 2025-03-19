import { Request, Response } from "express";

type User = {
    username: string
}

var users: User[] = []
export var user: User | null = null

export const login = async (request: Request, response: Response): Promise<void> => { 
    const {username} = request.body

    const exists = users.find(user => user.username === username)

    if (exists){
        response.status(400).json({error: "Username already in use"})
        return
    }

    users.push({username})
    user = {username}

    console.log(users)

    response.status(200).json({ username })
    return
}

export const logout = () => {
    users = users.filter(user_ => user_.username != user?.username)

    user = null

    console.log(users)
}