 import express from 'express'; 
 import {Ollama} from 'ollama'
 
 import type { Application, Request, Response } from 'express';
 import dotenv from 'dotenv';

 dotenv.config();

 const app: Application = express();
 const port = process.env.PORT || 3000;

 app.get('/api/translate', async (req: Request, res: Response) => {
  const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
  const response = await ollama.chat({
    model: 'gemma3:4b',
    messages: [{ role: 'user', content: 'Why is the sky blue?' }],
  });
  console.log(response.message.content)
   res.send(response.message.content);
 });

 app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
 });

  export default app;