import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import _ from "lodash";

dotenv.config();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!_.isNil(authHeader) && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]; // Bearer 다음에 있는 토큰을 가져옵니다.

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) {
        res.status(403).json({ message: "유저 인증에 실패하였습니다." });
        return;
      }

      res.locals.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "올바르지 않은 토큰 형식입니다." });
  }
};
