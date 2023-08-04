import { Op, Transaction } from "sequelize";
import { SeatReservations } from "../models/seatReservations.model";
import { Seats } from "../models/seats.model";

export class SeatReservationsRepository {
  async create(
    reservation: {
      reservationId: number;
      seatId: number;
    },
    transaction: Transaction
  ) {
    return await SeatReservations.create(reservation, { transaction });
  }

  async findAllByShowId(showId: number) {
    const reservations = await SeatReservations.findAll({
      include: [
        {
          model: Seats,
          where: { showId: showId },
          required: true,
        },
      ],
    });

    return reservations;
  }

  async findAllByReservationId(reservationIds: number[]) {
    return await SeatReservations.findAll({
      where: {
        reservationId: {
          [Op.in]: reservationIds,
        },
      },
    });
  }

  async countByReservationId(reservationIds: number[]) {
    return await SeatReservations.count({
      where: {
        reservationId: {
          [Op.in]: reservationIds,
        },
      },
    });
  }

  async countBySeatIds(ids: number[]) {
    return await SeatReservations.count({
      where: {
        reservationId: {
          [Op.not]: null,
        },
        seatId: ids,
      },
    });
  }

  async cancelSeatReservations(
    reservationId: number,
    transaction: Transaction
  ) {
    return await SeatReservations.update(
      { reservationId: null },
      {
        where: {
          reservationId,
        },
        transaction,
      }
    );
  }
}
