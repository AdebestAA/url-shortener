import { Request, Response } from "express";
import { generateRandomString } from "../helpers/generate-random-string";
import pool from "../configs/db-config";
import { frontendUrl } from "../constants";

const maxAttempts = 5;

export const createShortUrl = async (req: Request, res: Response) => {
  for (let i = 0; i < maxAttempts; i++) {
    const generateRandom = generateRandomString();
    try {
      await pool.query(
        `INSERT INTO urls(url,param)
    VALUES($1,$2)
    `,
        [req.body.url, generateRandom],
      );

      return res.json({
        success: true,
        param: generateRandom,
        long_url: req.body.url,
      });
    } catch (error) {
      // get postgress error for duplicate attempts
      const pgError = error as { code?: string; constraint?: string };
      // console.log("normal Error", error);
      console.log("pgError", pgError);

      if (pgError.code === "23505" && pgError.constraint === "urls_param_key") {
        continue;
      }

      return res.status(500).json({
        success: false,
        message: "sorry, unable to complete operation",
      });
    }
  }

  return res.status(500).json({
    success: false,
    message: "sorry, unable to generate a unique link, please try again",
  });
};

export const getShortUrl = async (req: Request, res: Response) => {
  const code = req.params?.param;

  try {
    const resp = await pool.query(
      `UPDATE urls
      SET usage_count = usage_count + 1  
      WHERE param = $1 
      RETURNING url,param`,
      [code],
    );
    if (resp.rows.length < 1) {
      return res.redirect(302, `${frontendUrl}/not-found`);
    }
    // const response = resp.rows[0];
    // console.log(resp.rows[0].url);

    return res.redirect(302, resp.rows[0].url);
  } catch (error) {
    return res.redirect(
      302,
      `${frontendUrl}/not-found?reason=something went wrong`,
    );
  }
};
