import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";

import moment from "moment";

export type Favorite = {
  artist: Artist;
  track?: TrackWithAlbum;
  setName: string;
};

export type Event = {
  start: moment.Moment;
  end: moment.Moment;
  name: string;
  location: string;
};
