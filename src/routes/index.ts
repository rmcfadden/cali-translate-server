import { Router, Request, Response } from 'express';
import TranslatorFactory from "../translators/translator-factory";

const router = Router();

 router.get('/api/translate', async (req: Request, res: Response) => {
  const {query} = req;
  const text = query.q || query.query as string | undefined;
  if(!text) throw new Error("Query param 'q' or 'query' is required");
  const target = query.target || query.to as string | undefined;
  if(!target) throw new Error("Query param 'to' or 'target' is required");

  const translatorProvider = "ollama";
  const translator = TranslatorFactory.create(translatorProvider);
  if(!translator) throw new Error(`Translator ${translatorProvider} not found`);

  const response2 = await translator.translate(text.toString(), target.toString());

  res.send(response2);
});


 export default router;