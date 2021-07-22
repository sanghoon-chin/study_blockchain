import {Router, Request, Response} from 'express';

const router = Router();

router
    .get('/ping', (req:Request, res:Response) => {
        res.send('good');
    })

export default router