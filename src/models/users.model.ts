import { Column, HasMany, Model, Table, Unique } from "sequelize-typescript";
import { Points } from "./points.model";
import { Reservations } from "./reservations.model";

@Table
export class Users extends Model {
  @Unique
  @Column({ allowNull: false })
  loginId!: string;

  @Column({ allowNull: false })
  password!: string;

  @Unique
  @Column({ allowNull: false })
  username!: string;

  @Column({ allowNull: false })
  isAdmin: boolean = false;

  @HasMany(() => Points)
  points!: Points[];

  @HasMany(() => Reservations)
  reservations!: Reservations[];

  // 보유 포인트는 따로 캐싱하지 않고 필요 시에 Points 테이블에서 계산해서 가져오도록 합니다. (PointsRepository.getUserPoint 함수 참고)
}
