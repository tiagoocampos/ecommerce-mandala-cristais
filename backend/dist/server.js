import cors from 'cors';
import "dotenv/config";
import express from 'express';
import { router } from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { startOrderExpirationJob } from './services/order/MaybeExpireOrders.js';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// X-New-Token: renovação deslizante do login; sem expor, o navegador não deixa o frontend ler
app.use(cors({ exposedHeaders: ["X-New-Token"] }));
app.use(router);
app.use(errorHandler);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta http://localhost:${port}`);
    // Rede de segurança opcional (desligada por padrão): não roda ao subir, para não acordar o banco
    startOrderExpirationJob();
});
//# sourceMappingURL=server.js.map