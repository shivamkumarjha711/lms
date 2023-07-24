import express from'express';
import cors from'cors';
import cookieParser from'cookie-parser';
import { config } from'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import errorMiddleware from './middlewares/error.middleware.js';
config();   // Config .env

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}))

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', function(req, res) {
    res.send('/pong')
})

// Routes of 3 Module 
app.use('/api/v1/user', userRoutes)

app.all('*', (req, res) => {
    res.status(404).send('OOPS!! page not found')
})

app.use(errorMiddleware);

export default app;