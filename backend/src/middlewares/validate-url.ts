import { NextFunction, Request, Response } from "express";
import { frontendUrl } from "../constants";

export const validateCreateUrl = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const url = req.body?.url;

  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ success: false, message: "url is required" });
  }

  try {
    const parsed = new URL(url.trim());
    // console.log("parsed", parsed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    return res
      .status(400)
      .json({ success: false, message: "url must be a valid http(s) URL" });
  }

  req.body.url = url.trim();
  next();
};

export const validateShortId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { param } = req.params;

  if (typeof param !== "string" || !/^[A-Za-z0-9_-]{1,32}$/.test(param)) {
    return res.redirect(302, `${frontendUrl}/not-found`);
  }

  next();
};
