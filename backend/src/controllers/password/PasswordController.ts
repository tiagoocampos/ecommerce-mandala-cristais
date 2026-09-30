import { Request, Response } from "express";
import { ForgotPasswordService } from "../../services/password/ForgotPasswordService.js";
import { ResetPasswordService } from "../../services/password/ResetPasswordService.js";

class PasswordController {
    /** POST /password/forgot (público) — sempre 200 com mensagem genérica */
    async forgot(req: Request, res: Response) {
        const { email } = req.body;
        const result = await new ForgotPasswordService().execute({ email });
        return res.json(result);
    }

    /** POST /password/reset (público) */
    async reset(req: Request, res: Response) {
        const { token, new_password } = req.body;
        const result = await new ResetPasswordService().execute({ token, new_password });
        return res.json(result);
    }
}

export { PasswordController };
