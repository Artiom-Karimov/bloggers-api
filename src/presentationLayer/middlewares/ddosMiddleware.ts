import { Request, Response, NextFunction } from "express";
import { ddos as config } from '../../config/config';

type Action = {
  ip: string;
  endpoint: string;
  timestamp: number;
};

let actions: Action[] = [];

const flushOutdated = () => {
  const fromTime = Date.now() - config.TimeoutSeconds * 1000;
  actions = actions.filter((a) => a.timestamp > fromTime);
}
const getAction = (req: Request): Action => {
  return {
    ip: req.ip,
    endpoint: req.path,
    timestamp: Date.now(),
  }
}
const checkHistory = (action: Action): boolean => {
  return (
    actions.filter(
      (a) => a.ip === action.ip && a.endpoint === action.endpoint,
    ).length <= config.MaxRequests
  );
}

export const ddosMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (config.disable) return next();
  flushOutdated();
  const action = getAction(req);
  actions.push(action);
  if (checkHistory(action)) return next();
  return res.sendStatus(429);
}