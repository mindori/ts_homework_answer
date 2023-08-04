import dayjs from "dayjs";
import _ from "lodash";
import { injectable } from "tsyringe";
import { Reservations } from "../models/reservations.model";
import { SeatReservations } from "../models/seatReservations.model";
import { Seats } from "../models/seats.model";
import { ReservationsRepository } from "../repositories/reservations.repository";
import { SeatReservationsRepository } from "../repositories/seatReservations.repository";
import { SeatsRepository } from "../repositories/seats.repository";
import { ShowsRepository } from "../repositories/shows.repository";
import { UsersRepository } from "../repositories/users.repository";

@injectable()
export class ShowsService {
  constructor(
    private usersRepository: UsersRepository,
    private showsRepository: ShowsRepository,
    private seatsRepository: SeatsRepository,
    private reservationsRepository: ReservationsRepository,
    private seatReservationsRepository: SeatReservationsRepository
  ) {}

  async getShows() {
    const shows = await this.showsRepository.findAll();
    return shows;
  }

  async getShowDetail(showId: number) {
    const show = await this.showsRepository.findOne(showId);
    if (_.isNil(show)) {
      throw new Error("SHOW_NOT_FOUND");
    }

    const reservationIdsDAO =
      await this.reservationsRepository.getReservationIds(show.id);
    const reservationIds = reservationIdsDAO.map(
      (reservationIdDAO: Reservations) => reservationIdDAO.id
    );
    const reservedSeatCount =
      await this.seatReservationsRepository.countByReservationId(
        reservationIds
      );
    const remainingSeats = show.maxSeats - reservedSeatCount;
    // 예약이 가능하기 위해서는 예약 가능한 시간이어야 하고 예약 가능한 좌석이 남아 있어야 합니다.
    const isBookable =
      dayjs(show.showTime).isAfter(dayjs()) &&
      reservedSeatCount < show.maxSeats;
    return {
      ...show,
      remainingSeats,
      isBookable,
    };
  }

  async addShow(
    userId: number,
    showMetadata: {
      title: string;
      description: string;
    },
    seatInfos: {
      numOfSeats: number;
      grade: string;
      price: number;
    }[],
    showTimes: Date[]
  ) {
    const user = await this.usersRepository.findUserByUserId(userId);

    if (_.isNil(user) || !user.isAdmin) {
      throw new Error("UNAUTHORIZED");
    }

    const isPastTime = showTimes.some((showTime) =>
      dayjs(showTime).isBefore(dayjs())
    );

    if (isPastTime) {
      throw new Error("INVALID_SHOW_TIME");
    }

    // maxSeats는 클라이언트에게 입력받는 것이 아닌 것에 주목해주세요.
    // seatInfos의 합으로 계산하여 데이터 정합성을 보장하여야 합니다.
    const maxSeats = seatInfos.reduce(
      (acc, seatInfo) => acc + seatInfo.numOfSeats,
      0
    );
    const shows = showTimes.map((showTime: Date) => ({
      ...showMetadata,
      maxSeats,
      showTime,
    }));
    const newShows = await this.showsRepository.bulkCreate(shows);

    for (const newShow of newShows) {
      const seats = [];
      let currentSeatNumber = 0;
      for (const seatInfo of seatInfos) {
        for (let i = 0; i < seatInfo.numOfSeats; i += 1) {
          seats.push({
            showId: newShow.id,
            seatNumber: ++currentSeatNumber,
            grade: seatInfo.grade,
            price: seatInfo.price,
          });
        }
      }
      // 여러개의 좌석을 한번에 생성하기 위해 bulkCreate를 사용합니다.
      // 쿼리가 한번만 실행되기 때문에 성능상 이점이 있습니다.
      await this.seatsRepository.bulkCreate(seats);
    }
  }

  async searchShows(query: string) {
    const shows = await this.showsRepository.search(query);
    return shows;
  }

  async getShowSeats(showId: number) {
    const show = await this.showsRepository.findOne(showId);
    if (_.isNil(show)) {
      throw new Error("SHOW_NOT_FOUND");
    }

    const seats = await this.seatsRepository.findAll(showId);
    const reservationIdsDAO =
      await this.reservationsRepository.getReservationIds(show.id);
    const reservationIds = reservationIdsDAO.map(
      (reservationIdDAO: Reservations) => reservationIdDAO.id
    );
    const seatReservations =
      await this.seatReservationsRepository.findAllByReservationId(
        reservationIds
      );
    const reservationSet = new Set(
      seatReservations.map(
        (seatReservation: SeatReservations) => seatReservation.seatId
      )
    );

    const detailedSeats = seats.map((seat: Seats) => {
      const isReserved = reservationSet.has(seat.id);
      return {
        ...seat,
        isReserved,
      };
    });

    return detailedSeats;
  }
}
