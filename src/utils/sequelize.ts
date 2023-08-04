import * as dotenv from "dotenv";
import { Sequelize } from "sequelize-typescript";
import { Points } from "../models/points.model";
import { Reservations } from "../models/reservations.model";
import { SeatReservations } from "../models/seatReservations.model";
import { Seats } from "../models/seats.model";
import { Shows } from "../models/shows.model";
import { Users } from "../models/users.model";

dotenv.config();

export const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  models: [Users, Shows, Seats, Reservations, SeatReservations, Points],
});

if (process.env.DB_SYNC === "true") {
  sequelize
    .sync()
    .then(() => console.log("데이터베이스 싱크를 성공하였습니다."))
    .catch((error) =>
      console.log(`데이터베이스 싱크를 실패하였습니다.: ${error}`)
    );
}
