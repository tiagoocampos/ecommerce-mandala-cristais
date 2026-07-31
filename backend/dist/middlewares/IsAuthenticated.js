import jwt from "jsonwebtoken";
import { InvalidToken } from "../exceptions/InvalidToken.js";
export function isAuthenticated(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken) {
        throw new InvalidToken();
    }
    const [, token] = authToken.split(" ");
    try {
        const { sub } = jwt.verify(token, process.env.JWT_SECRET);
        req.user_id = sub;
        return next();
    }
    catch (error) {
        throw new InvalidToken();
    }
}
//# sourceMappingURL=IsAuthenticated.js.map