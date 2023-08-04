import { Seats } from "../models/seats.model";

export class SeatsRepository {
  async bulkCreate(
    seats: {
      showId: number;
      seatNumber: number;
      grade: string;
      price: number;
    }[]
  ) {
    return await Seats.bulkCreate(seats);
  }

  async findByIds(ids: number[]) {
    return await Seats.findAll({
      where: {
        id: ids,
      },
    });
  }

  async findAll(showId: number) {
    return await Seats.findAll({
      attributes: ["id", "seatNumber", "grade", "price"],
      where: { showId },
      raw: true,
    });
  }

  async delete(id: number) {
    return await Seats.destroy({ where: { id } });
  }
}
