import express from 'express';
import http from 'http';
import type { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

import router from './routes/index';
import authentication from './services/authentication';
import type { Credential } from './models/credential';

dotenv.config();

const app: Application = express();


// Authentication
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-api-key']?.toString() ?? '';
  const userId = await authentication.authenticate({type: 'api-key', token } as Credential);
  req.user_id = userId;

  console.log('userId:', userId)

  next()
})

app.use('/', router);

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);

});


export default app;