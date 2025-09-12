 import express from 'express'; 
 
 import type { Application, Request, Response } from 'express';
 import dotenv from 'dotenv';

 dotenv.config();

 const app: Application = express();
 const port = process.env.PORT || 3000;

 app.get('/', (req: Request, res: Response) => {
   res.send('Hello from TypeScript Node.js Server!');
 });

 app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
 });