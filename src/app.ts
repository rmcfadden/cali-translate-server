import express from 'express';
import http from 'http';
import type { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

import router from './routes/index';
import authentication from './services/authentication';
import quota from './services/quota';
import type { Credential } from './models/credential';

// Module augmentation for Express Request
declare module 'express-serve-static-core' {
  interface Request {
    user_id?: number  | undefined;
    api_key_id?: number | undefined;
  }
}

dotenv.config();

const app: Application = express();

// Authentication
app.use(async (req: Request, _: Response, next: NextFunction) => {
  const token = req.headers['x-api-key']?.toString() ?? req.query['x-api-key']?.toString() ?? '';
  const authenticateResponse = await authentication.authenticate({type: 'api-key', token } as Credential);
  if(!authenticateResponse) throw Error('Authentication failed: cannot find api key');
  req.user_id = authenticateResponse?.user_id;
  req.api_key_id = authenticateResponse?.api_key_id;
  console.log('userId:', authenticateResponse?.user_id)
  next();
});

// Quotas
app.use(async (req: Request, _: Response, next: NextFunction) => {
  const response = await quota.check(req.api_key_id as number);
  console.log('Quota response:', response);
  next();
});

app.use('/', router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).send(err.message); // Send a generic error response
});

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;