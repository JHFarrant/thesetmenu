import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";

import { DateTime } from "luxon";

export type Favourite = {
  artist: Artist;
  track?: TrackWithAlbum;
  setName: string;
};

export type Event = {
  start: DateTime;
  end: DateTime;
  name: string;
  short: string;
  location: string;
};
