import dotenv from 'dotenv'
dotenv.config();
import connectDB from './config/connectdb.js'
import userRoutes from './routes/userRoutes.js'

import express from 'express'
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// CORS Policy
app.use(cors());

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Database Connection
connectDB(DATABASE_URL)

//load routes
app.use('/api/user', userRoutes)

//for api JSON
app.use(express.json())

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`)
})
