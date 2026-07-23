import cors from 'cors';
import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import { router } from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';



const app = express();
app.use(express.json());
app.use(cors());

app.use(router);

app.use(errorHandler);

const port = process.env.PORT || 3000;



app.listen(port, () => {
    console.log(`Servidor rodando na porta http://localhost:${port}`);
})