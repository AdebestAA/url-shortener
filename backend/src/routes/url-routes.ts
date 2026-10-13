import { Router } from "express";

import { createShortUrl, getShortUrl } from "../controllers/url-controller";
import {
  validateCreateUrl,
  validateShortId,
} from "../middlewares/validate-url";
import { generalLimiter } from "../middlewares/rate-limiter";

const router = Router();

router.post("/", generalLimiter, validateCreateUrl, createShortUrl);
router.get("/:param", validateShortId, getShortUrl);

export default router;
