import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Reservations } from "./reservations.model";
import { Users } from "./users.model";

@Table
export class Points extends Model {
  @ForeignKey(() => Users)
  @Column({ allowNull: false })
  userId!: number;

  @ForeignKey(() => Reservations)
  @Column
  reservationId!: number; // 가입 시 포인트를 지급할 때는 예약이 필요가 없으므로 null을 허용해야 합니다.

  @Column({ allowNull: false })
  point!: number;

  @Column({ allowNull: false })
  reason!: string;

  @BelongsTo(() => Users)
  user!: Users;

  @BelongsTo(() => Reservations)
  reservation!: Reservations;
}
