import dayjs from "dayjs";
import _ from "lodash";
import { Transaction } from "sequelize";
import { injectable } from "tsyringe";
import { Seats } from "../models/seats.model";
import { PointsRepository } from "../repositories/points.repository";
import { ReservationsRepository } from "../repositories/reservations.repository";
import { SeatReservationsRepository } from "../repositories/seatReservations.repository";
import { SeatsRepository } from "../repositories/seats.repository";
import { ShowsRepository } from "../repositories/shows.repository";
import { sequelize } from "../utils/sequelize";

@injectable()
export class ReservationsService {
  constructor(
    private showsRepository: ShowsRepository,
    private seatsRepository: SeatsRepository,
    private reservationsRepository: ReservationsRepository,
    private seatReservationsRepository: SeatReservationsRepository,
    private pointsRepository: PointsRepository
  ) {}

  async getReservationsByUserId(userId: number) {
    return await this.reservationsRepository.findReservationsByUserId(userId);
  }

  async reserveSeats(userId: number, seatIds: number[]) {
    const seats = await this.seatsRepository.findByIds(seatIds);
    if (seats.length < seatIds.length) {
      throw new Error("SEAT_NOT_FOUND");
    }

    const totalPrice = seats.reduce((acc, seat) => acc + seat.price, 0);
    const userPoint = await this.pointsRepository.getUserPoint(userId);

    if (userPoint < totalPrice) {
      throw new Error("NOT_ENOUGH_POINT");
    }

    const existingReservationsCount =
      await this.seatReservationsRepository.countBySeatIds(seatIds);
    if (existingReservationsCount > 0) {
      throw new Error("SEAT_ALREADY_RESERVED");
    }

    const showIdSet = new Set(seats.map((seat: Seats) => seat.showId));
    if (showIdSet.size !== 1) {
      throw new Error("SEAT_NOT_IN_SAME_SHOW");
    }

    const showId = seats[0].showId;

    const show = await this.showsRepository.findOne(showId);
    if (dayjs(show!.showTime).isBefore(dayjs())) {
      throw new Error("SHOW_ALREADY_STARTED");
    }

    await sequelize.transaction(async (transaction: Transaction) => {
      const newReservation = await this.reservationsRepository.create(
        { userId, showId },
        transaction
      );

      const reservationId = newReservation.id;
      for (const seat of seats) {
        await this.seatReservationsRepository.create(
          { reservationId, seatId: seat.id },
          transaction
        );
      }

      await this.pointsRepository.create(
        {
          userId,
          point: -totalPrice,
          reason: "공연 예약",
          reservationId: reservationId,
        },
        transaction
      );
    });
  }

  async cancelReservation(userId: number, reservationId: number) {
    const reservation = await this.reservationsRepository.findOne(
      reservationId
    );
    if (_.isNil(reservation)) {
      throw new Error("RESERVATION_NOT_FOUND");
    }
    if (reservation.isCanceled) {
      throw new Error("RESERVATION_ALREADY_CANCELED");
    }
    if (reservation.userId !== userId) {
      throw new Error("NOT_AUTHORIZED");
    }

    const refundPoint = await this.pointsRepository.getPointByReservationId(
      reservationId
    );

    await sequelize.transaction(async (transaction: Transaction) => {
      await this.reservationsRepository.cancelReservation(
        reservation,
        transaction
      );

      await this.seatReservationsRepository.cancelSeatReservations(
        reservationId,
        transaction
      );

      await this.pointsRepository.refundPoints(
        {
          userId,
          point: -refundPoint, // 중요: refundPoint가 음수이므로 -refundPoint를 해줘야 합니다.
          reason: "공연 예약 취소",
          reservationId,
        },
        transaction
      );
    });
  }
}
