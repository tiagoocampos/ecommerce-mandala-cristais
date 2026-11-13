// Importar SEMPRE primeiro: impede que os testes toquem o banco real (.env) —
// o dotenv não sobrescreve variáveis já definidas e o banco aqui é inalcançável de propósito.
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "60d";
process.env.MERCADOPAGO_ACCESS_TOKEN = "test-token";
export {};
