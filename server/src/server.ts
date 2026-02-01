import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// In-memory state object
const state = { data: 0 };

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri: string =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/your-app';

// (async () => {
//     try {
//         await mongoose.connect(uri);
//         console.log('Connected to the database');
//     } catch(error) {
//         console.error(error);
//     }
// })();

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send(`Server has state data value: ${state.data}`);
});

app.post('/api/state', (req: Request, res: Response) => {
    const newState = req.body;
    state['data'] +=1; // Example modification to state
    res.status(200).json({ message: 'State updated', state });
});



const PORT: string | number = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
