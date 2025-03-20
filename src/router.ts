import { Router, Request, Response } from "express"
import { validateDataInput } from "./services/middlewares/validateDataInput"
import { userLoginSchema } from "./inputSchemas/userSchemas"
import { listusers, login } from "./controllers/userController"

const router = Router()

router.get("/", async (request: Request, response: Response): Promise<void> => {
    response.status(200).send("Server is running")
    return
})

router.post("/login", validateDataInput(userLoginSchema), login)
router.get("/listusers", listusers)

export default router