import "./setup.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import jwt from "jsonwebtoken";
import prismaClient from "../src/prisma/index.js";
import { isAuthenticated, shouldRenew } from "../src/middlewares/IsAuthenticated.js";
import { InvalidToken } from "../src/exceptions/InvalidToken.js";
import { signUserToken, jwtExpiresIn } from "../src/utils/authToken.js";

const user = { id: "user-1", name: "Maria", email: "maria@example.com" };

function run(token: string | undefined) {
    const headers: Record<string, string> = {};
    const req = { headers: token ? { authorization: `Bearer ${token}` } : {} } as any;
    const res = { setHeader: (k: string, v: string) => { headers[k] = v; } } as any;
    let nextCalled = false;
    return isAuthenticated(req, res, () => { nextCalled = true; }).then(
        () => ({ req, headers, nextCalled, error: null as unknown }),
        (error) => ({ req, headers, nextCalled, error })
    );
}

test("duração padrão é 60d e respeita JWT_EXPIRES_IN", () => {
    assert.equal(jwtExpiresIn(), "60d");
    process.env.JWT_EXPIRES_IN = "12h";
    assert.equal(jwtExpiresIn(), "12h");
    process.env.JWT_EXPIRES_IN = "lixo";
    assert.equal(jwtExpiresIn(), "60d");
    process.env.JWT_EXPIRES_IN = "60d";
});

test("token expirado forjado -> 401 TOKEN_EXPIRED com mensagem amigável", async () => {
    const expired = jwt.sign({ name: "x" }, "test-secret", { subject: user.id, expiresIn: -10 });
    const { error, nextCalled } = await run(expired);
    assert.ok(error instanceof InvalidToken);
    assert.equal(error.code, "TOKEN_EXPIRED");
    assert.equal(error.statusCode, 401);
    assert.equal(error.message, "Sua sessão expirou. Faça login novamente.");
    assert.equal(nextCalled, false);
});

test("assinatura errada -> 401 TOKEN_INVALID", async () => {
    const forged = jwt.sign({ name: "x" }, "outro-segredo", { subject: user.id, expiresIn: "1d" });
    const { error } = await run(forged);
    assert.ok(error instanceof InvalidToken);
    assert.equal(error.code, "TOKEN_INVALID");
});

test("sem token e token malformado", async () => {
    assert.equal(((await run(undefined)).error as InvalidToken).code, "TOKEN_MISSING");
    assert.equal(((await run("abc.def")).error as InvalidToken).code, "TOKEN_INVALID");
});

test("token recém-emitido passa e NÃO é renovado (sem consultar o banco)", async () => {
    (prismaClient.user as any).findUnique = () => { throw new Error("não deveria consultar o banco"); };
    const { nextCalled, headers, req } = await run(signUserToken(user));
    assert.equal(nextCalled, true);
    assert.equal(req.user_id, user.id);
    assert.equal(headers["X-New-Token"], undefined);
});

test("usuário ativo com token além da metade da vida recebe X-New-Token válido", async () => {
    const now = Math.floor(Date.now() / 1000);
    const old = jwt.sign({ name: user.name, email: user.email, iat: now - 40 * 86400 }, "test-secret", {
        subject: "user-renova",
        expiresIn: 60 * 86400, // exp = iat + 60d
    });
    // iat = 40 dias atrás, exp = iat + 60d => faltam 20d (< metade) => renova
    (prismaClient.user as any).findUnique = async () => ({ id: "user-renova", name: user.name, email: user.email });
    const { nextCalled, headers } = await run(old);
    assert.equal(nextCalled, true);
    const renewed = jwt.verify(headers["X-New-Token"]!, "test-secret") as jwt.JwtPayload;
    assert.equal(renewed.sub, "user-renova");
    assert.equal(renewed.email, user.email);
    assert.ok(renewed.exp! - renewed.iat! === 60 * 86400);
});

test("usuário apagado não recebe token novo, mas a requisição segue válida", async () => {
    const now = Math.floor(Date.now() / 1000);
    const old = jwt.sign({ iat: now - 50 * 86400 }, "test-secret", { subject: "user-apagado", expiresIn: 60 * 86400 });
    (prismaClient.user as any).findUnique = async () => null;
    const { nextCalled, headers } = await run(old);
    assert.equal(nextCalled, true);
    assert.equal(headers["X-New-Token"], undefined);
});

test("shouldRenew: metade da vida", () => {
    const iat = 1000, exp = 1000 + 100;
    assert.equal(shouldRenew({ iat, exp }, (iat + 49) * 1000), false);
    assert.equal(shouldRenew({ iat, exp }, (iat + 50) * 1000), true);
    assert.equal(shouldRenew({}, 0), false);
});
