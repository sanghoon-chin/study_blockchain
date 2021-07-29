import express from 'express';
import cors from 'cors';

import router from './router/index';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.use((req, res, next) => {
    res.status(404).send('404 error!!')
})

const server = app.listen(4000, () => {
    console.log(`Running at ${4000} port`);
})

const exitRoutine = () => {
    server.close(() => {
        process.exit(0);
    })
}

process.on('SIGTERM', exitRoutine);
process.on('SIGINT', exitRoutine);