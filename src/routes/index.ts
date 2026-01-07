import { Router, Request, Response } from "express";
import crypto from "crypto";
import TranslatorFactory from "../translators/translator-factory";
import CacheFactory from "../caching/cache-factory";
import { TranslateRequest } from "../translate-request";
import { TranslateResponse } from "../translate-response";

const router = Router();

const getDurationMilliseconds = (
    startTime: bigint,
    endTime: bigint,
): number => {
    return Number(endTime - startTime) / 1000000;
};

router.get("/api/translate", async (req: Request, res: Response) => {
    const startTime = process.hrtime.bigint();
    const { query } = req;
    const text = query.q || (query.query as string | undefined);
    if (!text) throw new Error("Query param 'q' or 'query' is required");
    const target = query.target || (query.to as string | undefined);
    if (!target) throw new Error("Query param 'to' or 'target' is required");
    const tempCacheKey = (
        query.cachekey && (query.cachekey as string | undefined)
    )?.toString();
    const useCache =
        (query.usecache && (query.usecache as string | undefined))
            ?.toString()
            ?.toLowerCase() === "true";
    const request: TranslateRequest = {
        text: text.toString(),
        to: target.toString(),
    };
    const cacheKey =
        useCache && !tempCacheKey
            ? crypto
                  .createHash("sha256")
                  .update(JSON.stringify(request))
                  .digest("hex")
            : tempCacheKey;

    const translatorProvider = "ollama";
    const translator = TranslatorFactory.create(translatorProvider);
    if (!translator)
        throw new Error(`Translator ${translatorProvider} not found`);
    const cache = CacheFactory.create("mysql");
    if (cache && cacheKey) {
        const cachedTranslation = await cache.get(cacheKey);
        if (cachedTranslation) {
            const endTime = process.hrtime.bigint();
            const duration = getDurationMilliseconds(startTime, endTime);
            const response = JSON.parse(cachedTranslation) as TranslateResponse;
            res.send({ ...response, details: { duration, cacheKey } });
            return;
        }
    }

    const response = await translator.translate(request);
    console.log("Response: ", response);
    if (cache && cacheKey) {
        console.log("cacheKey:", cacheKey);
        console.log("cache:", cache);
        await cache.set(cacheKey.toString(), JSON.stringify(response));
    }

    const endTime = process.hrtime.bigint();
    const duration = getDurationMilliseconds(startTime, endTime);
    res.send({ ...response, details: { duration, cacheKey } });
});

export default router;
