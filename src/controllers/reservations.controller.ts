import { Request, Response, Router } from "express";
import _ from "lodash";
import { container } from "tsyringe";
import { authMiddleware } from "../auth/auth.middleware";
import { ReservationsService } from "../services/reservations.service";

const router: Router = Router();
const reservationsService = container.resolve(ReservationsService);

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const reservations = await reservationsService.getReservationsByUserId(
      user.id
    );

    res.json(reservations);
  } catch (error) {
    // TODO: 서버 에러 로깅
    res.status(500).json({ message: "서버 에러가 발생하였습니다." });
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const seatIds = req.body.seatIds;

    if (_.isEmpty(seatIds)) {
      res.status(400).json({
        message:
          "예매할 좌석 ID는 배열로 하나 이상의 좌석 ID를 포함해야 합니다. 데이터를 확인해주세요.",
      });
      return;
    }

    await reservationsService.reserveSeats(user.id, seatIds);
    res.json({ message: "성공적으로 예약되었습니다." });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.message) {
        case "SEAT_NOT_FOUND": {
          res.status(404).json({
            message: "존재하지 않는 좌석이 있습니다.",
          });
          break;
        }
        case "NOT_ENOUGH_POINT": {
          res.status(400).json({
            message: "보유 포인트가 모자랍니다.",
          });
          break;
        }
        case "SEAT_ALREADY_RESERVED": {
          res.status(409).json({
            message: "이미 예약된 좌석이 포함되어 있습니다.",
          });
          break;
        }
        case "SEAT_NOT_IN_SAME_SHOW": {
          res.status(400).json({
            message: "같은 공연의 좌석만 예약할 수 있습니다.",
          });
          break;
        }
        case "SHOW_ALREADY_STARTED": {
          res.status(400).json({
            message: "공연이 이미 시작되었습니다.",
          });
          break;
        }
        default: {
          res.status(500).json({
            message: "서버 에러가 발생하였습니다.",
          });
        }
      }
    } else {
      // TODO: 서버 에러 로깅
      res.status(500).json({ message: "서버 에러가 발생하였습니다." });
    }
  }
});

router.delete(
  "/:reservationId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      const reservationId = Number(req.params.reservationId);
      if (_.isNaN(reservationId)) {
        res.status(400).json({
          message: "잘못된 예약 ID입니다. 올바르게 예약 ID를 입력해주세요.",
        });
        return;
      }

      await reservationsService.cancelReservation(user.id, reservationId);
      res.json({ message: "예약이 성공적으로 취소되었습니다." });
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "RESERVATION_NOT_FOUND": {
            res.status(404).json({
              message: "존재하지 않는 예약입니다.",
            });
            break;
          }
          case "RESERVATION_ALREADY_CANCELED": {
            res.status(400).json({
              message: "이미 취소된 예약입니다.",
            });
            break;
          }
          case "NOT_AUTHORIZED": {
            res.status(401).json({
              message: "예약한 본인만 예약을 취소하실 수 있습니다.",
            });
            break;
          }
          default: {
            res.status(500).json({
              message: "서버 에러가 발생하였습니다.",
            });
          }
        }
      } else {
        // TODO: 서버 에러 로깅
        res.status(500).json({ message: "서버 에러가 발생하였습니다." });
      }
    }
  }
);

export const ReservationsController: Router = router;
