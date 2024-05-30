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
  id: string;
  start: moment.Moment;
  end: moment.Moment;
  name: string;
  location: string;
};
