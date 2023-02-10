import express, { Request, Response, NextFunction } from "express";

import SplitIO from "@splitsoftware/splitio/types/splitio";

const split = require("@splitsoftware/splitio");

// listen to a server using express
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

const factory: SplitIO.ISDK = split.SplitFactory({
  core: {
    authorizationKey: process.env.SPLIT_API_KEY,
  },
});

const client: SplitIO.IClient = factory.client();

// typescript types
interface LocationWithTimezone {
  location: string;
  timezoneName: string;
  timezoneAbbr: string;
  utcOffset: number;
}

// this is a middleware
const getLocationsWithTimezones = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locations: LocationWithTimezone[] = [
    {
      location: "Germany",
      timezoneName: "Central European Time",
      timezoneAbbr: "CET",
      utcOffset: 1,
    },
    {
      location: "China",
      timezoneName: "China Standard Time",
      timezoneAbbr: "CST",
      utcOffset: 8,
    },
    {
      location: "Argentina",
      timezoneName: "Argentina Time",
      timezoneAbbr: "ART",
      utcOffset: -3,
    },
    {
      location: "Japan",
      timezoneName: "Japan Standard Time",
      timezoneAbbr: "JST",
      utcOffset: 9,
    },
  ];

  if (req.treatment == "on")
    locations.push({
      location: "Kenya",
      timezoneName: "Eastern Africa Time",
      timezoneAbbr: "EAT",
      utcOffset: 3,
    });

  res.status(200).json(locations);
};

// express middleware
// answer the user request
const getTreatmentMiddleware = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key: SplitIO.SplitKey = <SplitIO.SplitKey>req.headers.authorization;
  req.treatment = client.getTreatment(key, "timezone_split");
  next();
};

// endpoint to show time zones around the world
app.get("/", getTreatmentMiddleware, getLocationsWithTimezones);
