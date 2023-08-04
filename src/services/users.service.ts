import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import _ from "lodash";
import { Op } from "sequelize";
import { injectable } from "tsyringe";
import { Users } from "../models/users.model";
import { PointsRepository } from "../repositories/points.repository";
import { UsersRepository } from "../repositories/users.repository";

dotenv.config();

@injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private pointsRepository: PointsRepository
  ) {}

  async register(loginId: string, password: string, username: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const oldUserCount = await Users.count({
      where: {
        [Op.or]: [{ loginId }, { username }],
      },
    });
    if (oldUserCount > 0) {
      throw new Error("DUPLICATED_ID_OR_USERNAME");
    }

    const newUser = await this.usersRepository.create({
      loginId,
      password: hashedPassword,
      username,
    });

    await this.pointsRepository.create({
      userId: newUser.id,
      point: 1000000,
      reason: "가입 축하 포인트",
    });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    return token;
  }

  async login(loginId: string, password: string) {
    const user = await this.usersRepository.findUserByLoginId(loginId);
    if (_.isNil(user)) {
      throw new Error("USER_NOT_FOUND");
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      throw new Error("PASSWORD_NOT_MATCH");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    return token;
  }

  async getUserProfile(userId: number) {
    const user = await this.usersRepository.findUserByUserId(userId);
    if (_.isNil(user)) {
      throw new Error("USER_NOT_FOUND");
    }

    const point = await this.pointsRepository.getUserPoint(userId);

    return {
      id: user.loginId,
      name: user.username,
      point,
    };
  }
}
