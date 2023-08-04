import dayjs from "dayjs";
import _ from "lodash";
import { Op } from "sequelize";
import { Shows } from "../models/shows.model";

export class ShowsRepository {
  async bulkCreate(
    shows: {
      title: string;
      description: string;
      showTime: Date;
    }[]
  ) {
    return await Shows.bulkCreate(shows);
  }

  async findOne(id: number) {
    const show = await Shows.findOne({
      attributes: ["id", "title", "description", "showTime", "maxSeats"],
      where: { id },
      raw: true,
    });

    // UTC +0 시간대를 현지 시간대로 변환합니다.
    return _.isNil(show)
      ? null
      : {
          id: show.id,
          title: show.title,
          showTime: dayjs(show.showTime).format(),
          description: show.description,
          maxSeats: show.maxSeats,
        };
  }

  async findAll() {
    const shows = await Shows.findAll({
      attributes: ["id", "title", "showTime"],
      order: [["showTime", "DESC"]],
    });

    // UTC +0 시간대를 현지 시간대로 변환합니다.
    return shows.map((show: Shows) => {
      return {
        id: show.id,
        title: show.title,
        showTime: dayjs(show.showTime).format(),
      };
    });
  }

  async search(keyword: string) {
    const shows = await Shows.findAll({
      attributes: ["id", "title", "description", "showTime"],
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            description: {
              [Op.like]: `%${keyword}%`,
            },
          },
        ],
      },
      order: [["showTime", "DESC"]],
    });

    // UTC +0 시간대를 현지 시간대로 변환합니다.
    return shows.map((show: Shows) => {
      return {
        id: show.id,
        title: show.title,
        description: show.description,
        showTime: dayjs(show.showTime).format(),
      };
    });
  }
}
