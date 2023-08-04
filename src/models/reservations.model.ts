import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Points } from "./points.model";
import { SeatReservations } from "./seatReservations.model";
import { Shows } from "./shows.model";
import { Users } from "./users.model";

@Table
export class Reservations extends Model {
  @ForeignKey(() => Users)
  @Column({ allowNull: false })
  userId!: number;

  @ForeignKey(() => Shows)
  @Column({ allowNull: false })
  showId!: number;

  @Column({ allowNull: false })
  isCanceled: boolean = false;

  @BelongsTo(() => Users)
  user!: Users;

  @BelongsTo(() => Shows)
  show!: Shows;

  @HasMany(() => SeatReservations)
  seatReservations!: SeatReservations[];

  @HasMany(() => Points)
  points!: Points[];
}
