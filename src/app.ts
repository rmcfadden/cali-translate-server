import express from 'express';
import http from 'http';
import type { Application } from 'express';
import dotenv from 'dotenv';

import router from './routes/index';

dotenv.config();

const app: Application = express();
app.use('/', router);

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;