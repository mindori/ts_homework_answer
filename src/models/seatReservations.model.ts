import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Reservations } from "./reservations.model";
import { Seats } from "./seats.model";

@Table
export class SeatReservations extends Model {
  @ForeignKey(() => Reservations)
  @Column
  reservationId!: number; // 예약이 걸려 있지 않은 상황에서는 null 허용을 해야 합니다.

  @ForeignKey(() => Seats)
  @Column({ allowNull: false })
  seatId!: number;

  @BelongsTo(() => Reservations)
  reservation!: Reservations;

  @BelongsTo(() => Seats)
  seat!: Seats;
}
