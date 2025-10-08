import { Router, Request, Response } from 'express';
import {Ollama} from 'ollama'

const router = Router();

 router.get('/api/translate', async (req: Request, res: Response) => {
  const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
  const response = await ollama.chat({
    model: 'gemma3:4b',
    messages: [{ role: 'user', content: 'Why is the sky blue?' }],
  });
  console.log(response.message.content)
   res.send(response.message.content);
 });

 export default router;