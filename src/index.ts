import * as dotenv from "dotenv";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import "reflect-metadata";
import { ReservationsController } from "./controllers/reservations.controller";
import { ShowsController } from "./controllers/shows.controller";
import { UsersController } from "./controllers/users.controller";

dotenv.config();
const app = express();

const notFoundHandler: RequestHandler = (req, res, next) => {
  res.status(404).send({ message: "요청하신 페이지를 찾을 수 없습니다." });
};

const payloadErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: "데이터 형식이 잘못되었습니다." });
  } else {
    next();
  }
};

app.use(express.json());
app.use("/users", UsersController);
app.use("/shows", ShowsController);
app.use("/reservations", ReservationsController);

app.use(payloadErrorHandler);
app.use(notFoundHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`예매 서비스 서버가 시작되었습니다. 포트는 ${port}번 입니다.`);
});
