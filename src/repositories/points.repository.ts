import _ from "lodash";
import { QueryTypes, Transaction } from "sequelize";
import { Points } from "../models/points.model";
import { sequelize } from "../utils/sequelize";

export class PointsRepository {
  async create(
    pointRecord: {
      userId: number;
      point: number;
      reason: string;
      reservationId?: number;
    },
    transaction?: Transaction
  ) {
    return _.isNil(transaction)
      ? await Points.create(pointRecord)
      : await Points.create(pointRecord, { transaction });
  }

  async getUserPoint(userId: number) {
    const result: { totalPoints: number }[] = await sequelize.query(
      `SELECT SUM(point) AS totalPoints FROM Points WHERE userId = :userId`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    );

    return result[0].totalPoints ? result[0].totalPoints : 0;
  }

  async getPointByReservationId(reservationId: number) {
    const result: { totalPoints: number }[] = await sequelize.query(
      `SELECT SUM(point) AS totalPoints FROM Points WHERE reservationId = :reservationId`,
      {
        replacements: { reservationId },
        type: QueryTypes.SELECT,
      }
    );

    return result[0].totalPoints ? result[0].totalPoints : 0;
  }

  async refundPoints(
    pointRecord: {
      userId: number;
      point: number;
      reason: string;
      reservationId?: number;
    },
    transaction: Transaction
  ) {
    return await Points.create(
      { ...pointRecord, isCanceled: true },
      { transaction }
    );
  }
}
