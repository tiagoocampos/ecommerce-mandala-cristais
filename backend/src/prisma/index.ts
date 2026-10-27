import "dotenv/config";
import { PrismaClient} from '../generated/prisma/client.js'
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL!}`;

const adapter = new PrismaPg({ connectionString, max: 5, idleTimeoutMillis: 10_000 })
const prismaClient = new PrismaClient({adapter})

export default prismaClient;

