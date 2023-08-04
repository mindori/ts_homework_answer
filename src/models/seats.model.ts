import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { SeatReservations } from "./seatReservations.model";
import { Shows } from "./shows.model";

@Table
export class Seats extends Model {
  @ForeignKey(() => Shows)
  @Column({ allowNull: false })
  showId!: number;

  @Column({ allowNull: false })
  seatNumber!: number;

  @Column({ allowNull: false })
  grade!: string;

  @Column({ allowNull: false })
  price!: number;

  @BelongsTo(() => Shows)
  show!: Shows;

  @HasMany(() => SeatReservations)
  seatReservations!: SeatReservations[];
}
