import { Users } from "../models/users.model";

export class UsersRepository {
  async create(user: { loginId: string; password: string; username: string }) {
    return Users.create(user);
  }

  async findUserByUserId(userId: number) {
    return Users.findOne({ where: { id: userId }, raw: true });
  }

  async findUserByLoginId(loginId: string) {
    return Users.findOne({ where: { loginId } });
  }
}
