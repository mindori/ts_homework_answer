import dayjs from "dayjs";
import { Transaction } from "sequelize";
import { Points } from "../models/points.model";
import { Reservations } from "../models/reservations.model";
import { Shows } from "../models/shows.model";
import { sequelize } from "../utils/sequelize";

export class ReservationsRepository {
  async create(
    groupReservation: {
      userId: number;
      showId: number;
    },
    transaction: Transaction
  ) {
    return await Reservations.create(groupReservation, { transaction });
  }

  async findOne(id: number) {
    return await Reservations.findOne({
      where: {
        id,
      },
    });
  }

  async findReservationsByUserId(userId: number) {
    const reservations = await Reservations.findAll({
      where: {
        userId: userId,
      },
      attributes: [
        [sequelize.col("Reservations.id"), "id"],
        [sequelize.col("Reservations.createdAt"), "reservationTime"],
        [sequelize.col("show.id"), "showId"],
        [sequelize.col("show.title"), "showTitle"],
        [sequelize.col("show.showTime"), "showTime"],
      ],
      include: [
        {
          model: Shows,
          attributes: [],
        },
        {
          model: Points,
          attributes: ["point", "reason"],
        },
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    // UTC +0 시간대를 현지 시간대로 변환합니다.
    return reservations.map((reservation: any) => {
      return {
        ...reservation,
        reservationTime: dayjs(reservation.reservationTime).format(),
        showTime: dayjs(reservation.showTime).format(),
      };
    });
  }

  async getReservationIds(showId: number) {
    return await Reservations.findAll({
      where: {
        showId,
      },
      attributes: ["id"],
    });
  }

  async cancelReservation(reservation: Reservations, transaction: Transaction) {
    return await reservation.update({ isCanceled: true }, { transaction });
  }
}
