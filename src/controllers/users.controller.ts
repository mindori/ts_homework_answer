import { Request, Response, Router } from "express";
import { container } from "tsyringe";
import { authMiddleware } from "../auth/auth.middleware";
import { UsersService } from "../services/users.service";

const router: Router = Router();
const userService = container.resolve(UsersService);

router.post("/register", async (req: Request, res: Response) => {
  const { loginId, password, username } = req.body;
  if (!loginId || !password || !username) {
    res.status(400).json({ message: "필수 항목이 누락되었습니다." });
    return;
  }

  const loginIdRegex = /^[A-Za-z0-9]{6,15}$/;
  if (!loginIdRegex.test(loginId)) {
    res
      .status(400)
      .json({ message: "아이디는 6~15자의 영문, 숫자만 허용됩니다." });
    return;
  }

  const passwordRegex = /^[A-Za-z0-9!@#$%^&*()]{8,15}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message: "비밀번호는 8~15자의 영문, 숫자, 특수문자만 허용됩니다.",
    });
    return;
  }

  const usernameRegex = /^[가-힣A-Za-z0-9]{2,15}$/;
  if (!usernameRegex.test(username)) {
    res
      .status(400)
      .json({ message: "이름은 2~15자의 한글, 영문, 숫자만 허용됩니다." });
    return;
  }

  try {
    const token = await userService.register(loginId, password, username);
    res.json({ token });
  } catch (err) {
    if (err instanceof Error) {
      res
        .status(400)
        .json({ message: "동일한 아이디 혹은 닉네임이 존재합니다." });
    } else {
      // TODO: 서버 에러 로깅
      res.status(500).json({ message: "서버 에러가 발생하였습니다." });
    }
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { loginId, password } = req.body;
    const token = await userService.login(loginId, password);
    res.json({ token });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "USER_NOT_FOUND") {
        res.status(400).json({ message: "존재하지 않는 아이디입니다." });
      } else {
        res.status(400).json({ message: "비밀번호를 잘못 입력하셨습니다." });
      }
    } else {
      // TODO: 서버 에러 로깅
      res.status(500).json({ message: "서버 에러가 발생하였습니다." });
    }
  }
});

router.get("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const profile = await userService.getUserProfile(user.id);
    res.json(profile);
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: "존재하지 않는 아이디입니다." });
    } else {
      // TODO: 서버 에러 로깅
      res.status(500).json({ message: "서버 에러가 발생하였습니다." });
    }
  }
});

export const UsersController: Router = router;
