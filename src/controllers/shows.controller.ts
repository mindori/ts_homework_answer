import { Request, Response, Router } from "express";
import _ from "lodash";
import { container } from "tsyringe";
import { authMiddleware } from "../auth/auth.middleware";
import { ShowsService } from "../services/shows.service";

const router: Router = Router();
const showsService = container.resolve(ShowsService);

router.get("/", async (req: Request, res: Response) => {
  try {
    const shows = await showsService.getShows();
    res.json(shows);
  } catch (err) {
    // TODO: 서버 에러 로깅
    res.status(500).json({ message: "서버 에러가 발생하였습니다." });
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { showMetadata, seatInfos, showTimes } = req.body;
    if (
      _.isNil(showMetadata) ||
      _.isNil(showMetadata.title) ||
      _.isNil(showMetadata.description) ||
      _.isEmpty(seatInfos) ||
      _.isEmpty(showTimes)
    ) {
      res.status(400).json({
        message: "공연 추가 데이터에서 필수 데이터 항목이 누락되었습니다.",
      });
      return;
    }

    await showsService.addShow(user.id, showMetadata, seatInfos, showTimes);
    res.status(201).json({ message: "공연 정보가 성공적으로 생성되었습니다." });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        res.status(401).json({ message: "공연을 추가할 권한이 없습니다." });
      } else {
        res.status(400).json({ message: "공연 시간대를 확인해주세요." });
      }
    } else {
      // TODO: 서버 에러 로깅
      res.status(500).json({ message: "서버 에러가 발생하였습니다." });
    }
  }
});

router.get("/search", async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!_.isString(query)) {
      res.status(400).json({
        message: "검색어가 올바르지 않습니다.",
      });
      return;
    }

    const shows = await showsService.searchShows(query);
    res.json(shows);
  } catch (err) {
    // TODO: 서버 에러 로깅
    res.status(500).json({ message: "서버 에러가 발생하였습니다." });
  }
});

router.get("/:showId", async (req: Request, res: Response) => {
  try {
    const showId = Number(req.params.showId);
    if (_.isNaN(showId)) {
      res.status(400).json({
        message: "잘못된 공연 ID입니다. 올바르게 공연 ID를 입력해주세요.",
      });
      return;
    }

    const showDetail = await showsService.getShowDetail(showId);
    res.json(showDetail);
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).json({ message: "공연을 찾을 수 없습니다1." });
    } else {
      // TODO: 서버 에러 로깅
      res.status(500).json({ message: "서버 에러가 발생하였습니다." });
    }
  }
});

router.get("/:showId/seats", async (req: Request, res: Response) => {
  try {
    const showId = Number(req.params.showId);
    if (_.isNaN(showId)) {
      res.status(400).json({
        message: "잘못된 공연 ID입니다. 올바르게 공연 ID를 입력해주세요.",
      });
      return;
    }

    const seats = await showsService.getShowSeats(showId);
    res.json(seats);
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).json({ message: "공연을 찾을 수 없습니다2." });
    } else {
      // TODO: 서버 에러 로깅
      res.status(500).json({ message: "서버 에러가 발생하였습니다." });
    }
  }
});

export const ShowsController: Router = router;
