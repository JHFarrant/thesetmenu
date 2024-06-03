import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";

import moment from "moment";

export interface SelectedEvents {
  [key: string]: string;
}

export type Favorite = {
  artist: Artist;
  track?: TrackWithAlbum;
  setName: string;
  relatedArtistName?: string | null;
};

export type Event = {
  id: string;
  short?: string;
  mbId?: string;
  start: moment.Moment;
  end: moment.Moment;
  name: string;
  location: string;
};
