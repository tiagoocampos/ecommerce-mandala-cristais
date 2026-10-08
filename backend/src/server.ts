import cors from 'cors';
import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import { router } from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { startOrderExpirationJob } from './services/order/ExpirePendingOrdersService.js';



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(router);

app.use(errorHandler);

const port = process.env.PORT || 3000;



app.listen(port, () => {
    console.log(`Servidor rodando na porta http://localhost:${port}`);
    // Pedidos pendentes vencidos: cancela e devolve o estoque (no boot e a cada 5 min)
    startOrderExpirationJob();
})