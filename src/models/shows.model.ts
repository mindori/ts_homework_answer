import { Column, HasMany, Model, Table } from "sequelize-typescript";
import { Reservations } from "./reservations.model";
import { Seats } from "./seats.model";

@Table
export class Shows extends Model {
  @Column({ allowNull: false })
  title!: string;

  @Column({ allowNull: false })
  description!: string;

  @Column({ allowNull: false })
  showTime!: Date;

  @Column({ allowNull: false })
  maxSeats!: number;

  @HasMany(() => Reservations)
  reservations!: Reservations[];

  @HasMany(() => Seats)
  seats!: Seats[];
}
