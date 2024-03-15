"use client";

import { useEffect, useState, useMemo } from "react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { FollowedArtists } from "@spotify/web-api-ts-sdk/dist/mjs/types";

import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";
import { Favorite, Event } from "@/types";
import spotifyIDsJson from "../public/g2023SpotifyIDs.json";
import g2023 from "../public/g2023.json";
import moment from "moment";

import { Button, Card, Spinner } from "flowbite-react";
import { useReadLocalStorage } from "usehooks-ts";
import Footer from "../components/footer";
import Itinerary from "../components/itinerary";

import { shiftedDay } from "../components/itinerary";
const spotifyTokenStorageID =
  "spotify-sdk:AuthorizationCodeWithPKCEStrategy:token";

const removeDupes = (totalArray: any[], key?: string) => {
  const _key = key ?? "setName";
  let uniqueArray: any[] = [];
  totalArray.forEach((x) => {
    if (!uniqueArray.some((y) => y[_key] === x[_key])) {
      uniqueArray.push(x);
    }
  });
  return uniqueArray;
};

export default function Home() {
  const spotifyKeys: any = useReadLocalStorage(spotifyTokenStorageID);

  const SpotifyClientID = "7116f40f98d64f5cbb9e2aafb2209702";
  const ThisURL =
    typeof window !== "undefined"
      ? window.location.origin + "/"
      : "RedirectURLUnknown";

  // console.log(`RedirectURL=${ThisURL}`);

  const sdk = useMemo(
    () =>
      SpotifyApi.withUserAuthorization(SpotifyClientID, ThisURL, [
        "user-top-read",
        "user-follow-read",
      ]),
    []
  );

  // const [sdk, setSDK] = useState<SpotifyApi>()
  const [user, setUser] = useState<any>();

  const [artistsLoading, setArtistsLoading] = useState<boolean>(false);
  const [tracksLoading, setTracksLoading] = useState<boolean>(false);
  const [followsLoading, setFollowsLoading] = useState<boolean>(false);

  const loadingSpotifyData = artistsLoading || tracksLoading || followsLoading;

  const [intialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [follows, setFollows] = useState<Artist[]>([]);

  const [topTracks, setTopTracks] = useState<TrackWithAlbum[]>([]);

  const [recommendationsEnabled, setRecommendationsEnabled] =
    useState<boolean>(false);

  const share = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "The Set Menu",
          url: "https://thesetmenu.co.uk/",
        })
        .then(() => {
          console.log("Share success");
        })
        .catch(console.error);
    } else {
      console.log("Native sharing unavailable");
      window.open(
        "whatsapp://send?text=The Set Menu - https://thesetmenu.co.uk/"
      );
    }
  };

  const logout = () => {
    typeof window !== "undefined";
    window.localStorage.removeItem(spotifyTokenStorageID);
    window.location.reload();
  };
  // const isAuth = () => {
  //   sdk?.currentUser.topItems("artists")
  // }

  const performSpotifyAuth = async () => {
    console.log("Triggered Auth - Started");
    // setSDK(sdk)
    await sdk.authenticate();
    console.log("Triggered Auth - Finished");
  };

  const fetchAll = () => {
    const fetchArtists = async () => {
      console.log("Fetching artists...");
      // const artistsPage = await sdk.currentUser.topItems("artists")
      const offset = 0;
      const timeRange = "medium_term";
      // const shortTerm1 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=0&time_range=short_term`)
      // const shortTerm2 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=49&time_range=short_term`)
      const mediumTerm1 = sdk.makeRequest<Promise<Page<Artist>>>(
        "GET",
        `me/top/artists?limit=50&offset=0&time_range=medium_term`
      );
      const mediumTerm2 = sdk.makeRequest<Promise<Page<Artist>>>(
        "GET",
        `me/top/artists?limit=50&offset=49&time_range=medium_term`
      );
      const longTerm1 = sdk.makeRequest<Promise<Page<Artist>>>(
        "GET",
        `me/top/artists?limit=50&offset=0&time_range=long_term`
      );
      const longTerm2 = sdk.makeRequest<Promise<Page<Artist>>>(
        "GET",
        `me/top/artists?limit=50&offset=49&time_range=long_term`
      );
      try {
        const artistsPage = await Promise.all([
          mediumTerm1,
          mediumTerm2,
          longTerm1,
          longTerm2,
        ]);
        const newTopArtists = artistsPage.reduce(
          (artists, a) => artists.concat(a.items),
          [] as Array<any>
        );
        setTopArtists(newTopArtists);
        console.log(
          `Your Top Artists:\n${removeDupes(newTopArtists, "name")
            .map((a) => `${a.name} --> ${a.id}`)
            .join("\n")}`
        );
      } catch (error) {
        console.error(error);
      }
      setArtistsLoading(false);
    };

    const fetchFollows = async () => {
      console.log("Fetching follows...");
      // const artistsPage = await sdk.currentUser.topItems("artists")
      let cursor = undefined;
      let followsPage = [];
      let count = 0;
      try {
        while (cursor !== null && count < 5) {
          // console.log(`cursor ${cursor} count ${count}`)
          const response: FollowedArtists & { artists: { cursors?: any } } =
            await sdk.currentUser.followedArtists(cursor, 49);
          followsPage.push(response);
          cursor = response.artists.cursors.after;
          count++;
        }
        const newFollows = followsPage.reduce(
          (artists, a) => artists.concat(a.artists.items),
          [] as Array<any>
        );
        setFollows(newFollows);
        console.log(
          `Your Artist Follows:\n${removeDupes(newFollows, "name")
            .map((a) => `${a.name} --> ${a.id}`)
            .join("\n")}`
        );
      } catch (error) {
        console.error(error);
      }
      setFollowsLoading(false);
    };

    const fetchTracks = async () => {
      console.log("Fetching tracks...");
      // const artistsPage = await sdk.currentUser.topItems("artists")
      const offset = 0;
      const timeRange = "medium_term";
      // const shortTerm1 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>("GET", `me/top/tracks?limit=50&offset=0&time_range=short_term`)
      // const shortTerm2 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=49&time_range=short_term`)
      const mediumTerm1 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>(
        "GET",
        `me/top/tracks?limit=50&offset=0&time_range=medium_term`
      );
      const mediumTerm2 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>(
        "GET",
        `me/top/tracks?limit=50&offset=49&time_range=medium_term`
      );
      const longTerm1 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>(
        "GET",
        `me/top/tracks?limit=50&offset=0&time_range=long_term`
      );
      const longTerm2 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>(
        "GET",
        `me/top/tracks?limit=50&offset=49&time_range=long_term`
      );

      try {
        const tracksPage = await Promise.all([
          mediumTerm1,
          mediumTerm2,
          longTerm1,
          longTerm2,
        ]);
        const newTopTracks = tracksPage.reduce(
          (tracks, a) => tracks.concat(a.items),
          [] as Array<any>
        );
        setTopTracks(newTopTracks);
        console.log(
          `Your Top Artists (from your top tracks):\n${removeDupes(
            newTopTracks,
            "name"
          )
            .map((t) =>
              t.artists.map((a: any) => `${a.name} --> ${a.id}`).join(", ")
            )
            .join("\n")}`
        );
      } catch (error) {
        console.error(error);
      }
      setTracksLoading(false);
    };
    setArtistsLoading(true);
    setTopArtists([]);
    fetchArtists().catch(console.error);

    setTracksLoading(true);
    setTopTracks([]);
    fetchTracks().catch(console.error);

    setFollowsLoading(true);
    setFollows([]);
    fetchFollows().catch(console.error);
  };
  const spotifyIDs2ActsIncludingRecommendations: any = spotifyIDsJson;
  const spotifyIDs2ActsWithoutRecommendations: any = Object.entries(
    spotifyIDsJson
  ).reduce(
    (filteredSpotifyIds: any, [id, value]: [string, any]) => ({
      ...filteredSpotifyIds,
      ...(value.related_artist_name === null ? { [id]: value } : {}),
    }),
    {}
  );

  // const spotifyIDsIncludingRecommendations: any = Object.keys(spotifyIDs2ActsIncludingRecommendations);
  const spotifyIDsWithoutRecommendations: any = Object.keys(
    spotifyIDs2ActsWithoutRecommendations
  );

  const spotifyIDs2Acts = recommendationsEnabled
    ? spotifyIDs2ActsIncludingRecommendations
    : spotifyIDs2ActsWithoutRecommendations;
  const spotifyIDs = Object.keys(spotifyIDs2Acts);

  // console.log(JSON.stringify(spotifyIDs, null, 3));
  const matchedArtists = topArtists
    .filter((a) => spotifyIDs.includes(a.id))
    .reduce((artists, a) => {
      const matchedArtist = spotifyIDs2Acts[a.id];
      return {
        ...artists,
        [matchedArtist.act_name]: {
          artist: matchedArtist.related_artist_name
            ? matchedArtist.act_artist_data
            : a,
          setName: matchedArtist.act_name,
          relatedArtistName: matchedArtist.related_artist_name,
        },
      };
    }, {});

  const matchedFollows = follows
    .filter((a) => spotifyIDs.includes(a.id))
    .reduce((artists, a) => {
      const matchedArtist = spotifyIDs2Acts[a.id];
      return {
        ...artists,
        [matchedArtist.act_name]: {
          artist: a,
          setName: matchedArtist.act_name,
          relatedArtistName: matchedArtist.related_artist_name,
        },
      };
    }, {});

  const matchedArtistsWithTracks = topTracks.reduce(
    (artists, t) => ({
      ...artists,
      ...t.artists
        .filter((a) => spotifyIDsWithoutRecommendations.includes(a.id))
        .reduce((trackArtists, a) => {
          const matchedArtist = spotifyIDs2Acts[a.id];
          return {
            ...trackArtists,
            [matchedArtist.act_name]: {
              track: t,
              artist: a,
              setName: matchedArtist.act_name,
              relatedArtistName: null,
            },
          };
        }, {}),
    }),
    {}
  );

  const extractEventsByTime = (json: any): Event[] => {
    const events = json.locations.reduce(
      (events: any, location: any) =>
        events.concat(
          location.events.map((e: any) => ({
            ...e,
            start: moment(e.start),
            end: moment(e.end),
            location: location.name,
          }))
        ),
      []
    );
    events.sort((a: any, b: any) => a.start - b.start);
    return events;
  };

  // const extractEventsByArtist = (events: any[]) => {
  //   return events.reduce(
  //     (artistEvents: any, e: any) => ({
  //       ...artistEvents,
  //       [e.name]: { events: [e].concat(artistEvents[e.name]?.events ?? []) },
  //     }),
  //     {}
  //   );
  // };

  // const favoriteArtists = removeDupes(
  //   Object.values(matchedArtists).concat(Object.values(matchedArtistsWithTracks))
  // );

  const favoriteArtists: { [key: string]: Favorite } = {
    ...matchedArtistsWithTracks,
    ...matchedArtists,
    ...matchedFollows,
  };

  // favoriteArtists.sort((a, b) => b.artist.popularity - a.artist.popularity);

  const eventsByTime = extractEventsByTime(g2023);
  // const eventsByArtist = extractEventsByArtist(eventsByTime);

  const itinerary = eventsByTime.filter(
    (e: Event) => e.name in favoriteArtists
  );

  const itineraryInDays = itinerary.reduce(
    (daily: Event[][], e: Event): Event[][] => {
      const mostRecentDay: Event[] =
        (daily.length && daily.length && daily[daily.length - 1]) || [];
      if (
        mostRecentDay.length &&
        shiftedDay(mostRecentDay[mostRecentDay.length - 1].start).isSame(
          shiftedDay(e.start)
        )
      ) {
        mostRecentDay.push(e);
      } else {
        daily.push([e]);
      }
      return daily;
    },
    []
  );

  if (!loadingSpotifyData && itineraryInDays.length) {
    console.log(
      `Your Matched Top Artists:\n${removeDupes(Object.values(matchedArtists))
        .map((a) => `${a.artist.name} --> ${a.artist.id}`)
        .join("\n")}`
    );

    console.log(
      `Your Matched Artist Follows:\n${removeDupes(
        Object.values(matchedFollows)
      )
        .map((a) => `${a.artist.name} --> ${a.artist.id}`)
        .join("\n")}`
    );

    console.log(
      `Your Matched Artist With Tracks:\n${removeDupes(
        Object.values(matchedArtistsWithTracks)
      )
        .map((a) => `${a.artist.name} --> ${a.artist.id}`)
        .join("\n")}`
    );
    console.log(
      `Your Personal Itinerary:\n${itineraryInDays
        .map(
          (day) =>
            `${day[0].start.format("ddd")}\n########\n${day
              .map((e) => `${e.name} | ${e.location} | ${e.start} - ${e.end}`)
              .join("\n")}`
        )
        .join("\n")}`
    );
  }
  const dummyItinearryInDays = [
    [
      {
        name: "Flowdan Live",
        short: "flowda(1)",
        start: moment("2023-06-22T21:00:00.000Z"),
        end: moment("2023-06-22T21:15:00.000Z"),
        mbId: "58998667-6dba-4436-a94c-b3ca20cd4234",
        url: "http://flowdan(@big_flowdan)|instagram",
        location: "Nowhere",
      },
    ],
    [
      {
        name: "Ben Howard",
        short: "benhow(1)",
        start: moment("2023-06-23T10:30:00.000Z"),
        end: moment("2023-06-23T11:30:00.000Z"),
        url: "https://www.benhowardmusic.co.uk/",
        location: "Other Stage",
      },
      {
        name: "Jamie Webster",
        short: "jamiew(1)",
        start: moment("2023-06-23T14:35:00.000Z"),
        end: moment("2023-06-23T15:35:00.000Z"),
        url: "https://www.jamiewebstermusic.com",
        location: "Avalon Stage",
      },
      {
        name: "Texas",
        short: "texas(1)",
        start: moment("2023-06-23T15:15:00.000Z"),
        end: moment("2023-06-23T16:15:00.000Z"),
        url: "https://www.texas.uk.com/",
        location: "Pyramid Stage",
      },
    ],
  ];
  const dummyFavouriteArtists = {
    "Caroline Polachek": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4Ge8xMJNwt6EEXOzVXju9a",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["art pop", "escape room", "indie pop", "indietronica"],
        href: "https://api.spotify.com/v1/artists/4Ge8xMJNwt6EEXOzVXju9a",
        id: "4Ge8xMJNwt6EEXOzVXju9a",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebd06f948216f34ea0298aef43",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174d06f948216f34ea0298aef43",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178d06f948216f34ea0298aef43",
            width: 160,
          },
        ],
        name: "Caroline Polachek",
        popularity: 63,
        type: "artist",
        uri: "spotify:artist:4Ge8xMJNwt6EEXOzVXju9a",
      },
      setName: "Caroline Polachek",
    },
    "Loyle Carner": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4oDjh8wNW5vDHyFRrDYC4k",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["indie soul", "london rap"],
        href: "https://api.spotify.com/v1/artists/4oDjh8wNW5vDHyFRrDYC4k",
        id: "4oDjh8wNW5vDHyFRrDYC4k",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebad385f12e4046922f7441fa7",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174ad385f12e4046922f7441fa7",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178ad385f12e4046922f7441fa7",
            width: 160,
          },
        ],
        name: "Loyle Carner",
        popularity: 65,
        type: "artist",
        uri: "spotify:artist:4oDjh8wNW5vDHyFRrDYC4k",
      },
      setName: "Loyle Carner",
    },
    "Maggie Rogers": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4NZvixzsSefsNiIqXn0NDe",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["indie pop"],
        href: "https://api.spotify.com/v1/artists/4NZvixzsSefsNiIqXn0NDe",
        id: "4NZvixzsSefsNiIqXn0NDe",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebb3e3db4f0aec872ec513b3c0",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174b3e3db4f0aec872ec513b3c0",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178b3e3db4f0aec872ec513b3c0",
            width: 160,
          },
        ],
        name: "Maggie Rogers",
        popularity: 68,
        type: "artist",
        uri: "spotify:artist:4NZvixzsSefsNiIqXn0NDe",
      },
      setName: "Maggie Rogers",
    },
    "The Blessed Madonna": {
      track: {
        album: {
          album_type: "ALBUM",
          artists: [
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we",
              },
              href: "https://api.spotify.com/v1/artists/6M2wZ9GZgrQXHCFfjv46we",
              id: "6M2wZ9GZgrQXHCFfjv46we",
              name: "Dua Lipa",
              type: "artist",
              uri: "spotify:artist:6M2wZ9GZgrQXHCFfjv46we",
            },
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/4TvhRzxIL1le2PWCeUqxQw",
              },
              href: "https://api.spotify.com/v1/artists/4TvhRzxIL1le2PWCeUqxQw",
              id: "4TvhRzxIL1le2PWCeUqxQw",
              name: "The Blessed Madonna",
              type: "artist",
              uri: "spotify:artist:4TvhRzxIL1le2PWCeUqxQw",
            },
          ],
          available_markets: [
            "AD",
            "AE",
            "AR",
            "AU",
            "BE",
            "BG",
            "BH",
            "BO",
            "BR",
            "CA",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DK",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HU",
            "ID",
            "IE",
            "IL",
            "IN",
            "IS",
            "IT",
            "JO",
            "JP",
            "KW",
            "LB",
            "LI",
            "LT",
            "LU",
            "LV",
            "MA",
            "MC",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PH",
            "PL",
            "PS",
            "PT",
            "PY",
            "QA",
            "RO",
            "SA",
            "SE",
            "SG",
            "SK",
            "SV",
            "TH",
            "TN",
            "TR",
            "TW",
            "US",
            "UY",
            "VN",
            "ZA",
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/3W04W2HfQ5kVeByxfjbu2C",
          },
          href: "https://api.spotify.com/v1/albums/3W04W2HfQ5kVeByxfjbu2C",
          id: "3W04W2HfQ5kVeByxfjbu2C",
          images: [
            {
              height: 640,
              url: "https://i.scdn.co/image/ab67616d0000b273ac5db6adf5520c8eef3fd65e",
              width: 640,
            },
            {
              height: 300,
              url: "https://i.scdn.co/image/ab67616d00001e02ac5db6adf5520c8eef3fd65e",
              width: 300,
            },
            {
              height: 64,
              url: "https://i.scdn.co/image/ab67616d00004851ac5db6adf5520c8eef3fd65e",
              width: 64,
            },
          ],
          name: "Club Future Nostalgia (DJ Mix)",
          release_date: "2020-08-28",
          release_date_precision: "day",
          total_tracks: 17,
          type: "album",
          uri: "spotify:album:3W04W2HfQ5kVeByxfjbu2C",
        },
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we",
            },
            href: "https://api.spotify.com/v1/artists/6M2wZ9GZgrQXHCFfjv46we",
            id: "6M2wZ9GZgrQXHCFfjv46we",
            name: "Dua Lipa",
            type: "artist",
            uri: "spotify:artist:6M2wZ9GZgrQXHCFfjv46we",
          },
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/4TvhRzxIL1le2PWCeUqxQw",
            },
            href: "https://api.spotify.com/v1/artists/4TvhRzxIL1le2PWCeUqxQw",
            id: "4TvhRzxIL1le2PWCeUqxQw",
            name: "The Blessed Madonna",
            type: "artist",
            uri: "spotify:artist:4TvhRzxIL1le2PWCeUqxQw",
          },
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/6J7biCazzYhU3gM9j1wfid",
            },
            href: "https://api.spotify.com/v1/artists/6J7biCazzYhU3gM9j1wfid",
            id: "6J7biCazzYhU3gM9j1wfid",
            name: "Jamiroquai",
            type: "artist",
            uri: "spotify:artist:6J7biCazzYhU3gM9j1wfid",
          },
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/5Il27M5JXuQLgwDgVrQMgo",
            },
            href: "https://api.spotify.com/v1/artists/5Il27M5JXuQLgwDgVrQMgo",
            id: "5Il27M5JXuQLgwDgVrQMgo",
            name: "Dimitri From Paris",
            type: "artist",
            uri: "spotify:artist:5Il27M5JXuQLgwDgVrQMgo",
          },
        ],
        available_markets: [
          "AD",
          "AE",
          "AR",
          "AU",
          "BE",
          "BG",
          "BH",
          "BO",
          "BR",
          "CA",
          "CL",
          "CO",
          "CR",
          "CY",
          "CZ",
          "DK",
          "DO",
          "DZ",
          "EC",
          "EE",
          "EG",
          "ES",
          "FI",
          "FR",
          "GB",
          "GR",
          "GT",
          "HK",
          "HN",
          "HU",
          "ID",
          "IE",
          "IL",
          "IN",
          "IS",
          "IT",
          "JO",
          "JP",
          "KW",
          "LB",
          "LI",
          "LT",
          "LU",
          "LV",
          "MA",
          "MC",
          "MT",
          "MX",
          "MY",
          "NI",
          "NL",
          "NO",
          "NZ",
          "OM",
          "PA",
          "PE",
          "PH",
          "PL",
          "PS",
          "PT",
          "PY",
          "QA",
          "RO",
          "SA",
          "SE",
          "SG",
          "SK",
          "SV",
          "TH",
          "TN",
          "TR",
          "TW",
          "US",
          "UY",
          "VN",
          "ZA",
        ],
        disc_number: 1,
        duration_ms: 180040,
        explicit: false,
        external_ids: {
          isrc: "GBAHT2000696",
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/6oCGHGu19poEz8iF3ZXHrj",
        },
        href: "https://api.spotify.com/v1/tracks/6oCGHGu19poEz8iF3ZXHrj",
        id: "6oCGHGu19poEz8iF3ZXHrj",
        is_local: false,
        name: "Break My Heart / Cosmic Girl (Dimitri From Paris Edit) [Mixed]",
        popularity: 53,
        preview_url:
          "https://p.scdn.co/mp3-preview/a6accaa4c0f70fda4e260fad4dbbfa9a6e0c6044?cid=7116f40f98d64f5cbb9e2aafb2209702",
        track_number: 8,
        type: "track",
        uri: "spotify:track:6oCGHGu19poEz8iF3ZXHrj",
      },
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4TvhRzxIL1le2PWCeUqxQw",
        },
        href: "https://api.spotify.com/v1/artists/4TvhRzxIL1le2PWCeUqxQw",
        id: "4TvhRzxIL1le2PWCeUqxQw",
        name: "The Blessed Madonna",
        type: "artist",
        uri: "spotify:artist:4TvhRzxIL1le2PWCeUqxQw",
      },
      setName: "The Blessed Madonna",
    },
    "Jamie Webster": {
      track: {
        album: {
          album_type: "ALBUM",
          artists: [
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/5ugVdZNXtMIj6ECTzGsyqS",
              },
              href: "https://api.spotify.com/v1/artists/5ugVdZNXtMIj6ECTzGsyqS",
              id: "5ugVdZNXtMIj6ECTzGsyqS",
              name: "JAMIE WEBSTER",
              type: "artist",
              uri: "spotify:artist:5ugVdZNXtMIj6ECTzGsyqS",
            },
          ],
          available_markets: [
            "AD",
            "AE",
            "AR",
            "AT",
            "AU",
            "BE",
            "BG",
            "BH",
            "BO",
            "BR",
            "CA",
            "CH",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DE",
            "DK",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HU",
            "ID",
            "IE",
            "IL",
            "IN",
            "IS",
            "IT",
            "JO",
            "JP",
            "KW",
            "LB",
            "LI",
            "LT",
            "LU",
            "LV",
            "MA",
            "MC",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PH",
            "PL",
            "PS",
            "PT",
            "PY",
            "QA",
            "RO",
            "SA",
            "SE",
            "SG",
            "SK",
            "SV",
            "TH",
            "TN",
            "TR",
            "TW",
            "US",
            "UY",
            "VN",
            "ZA",
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/3HP0fAMCGrJOpPfGqRGIDY",
          },
          href: "https://api.spotify.com/v1/albums/3HP0fAMCGrJOpPfGqRGIDY",
          id: "3HP0fAMCGrJOpPfGqRGIDY",
          images: [
            {
              height: 640,
              url: "https://i.scdn.co/image/ab67616d0000b273e5873adaa127db844980cf2a",
              width: 640,
            },
            {
              height: 300,
              url: "https://i.scdn.co/image/ab67616d00001e02e5873adaa127db844980cf2a",
              width: 300,
            },
            {
              height: 64,
              url: "https://i.scdn.co/image/ab67616d00004851e5873adaa127db844980cf2a",
              width: 64,
            },
          ],
          name: "We Get By",
          release_date: "2020-08-21",
          release_date_precision: "day",
          total_tracks: 12,
          type: "album",
          uri: "spotify:album:3HP0fAMCGrJOpPfGqRGIDY",
        },
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/5ugVdZNXtMIj6ECTzGsyqS",
            },
            href: "https://api.spotify.com/v1/artists/5ugVdZNXtMIj6ECTzGsyqS",
            id: "5ugVdZNXtMIj6ECTzGsyqS",
            name: "JAMIE WEBSTER",
            type: "artist",
            uri: "spotify:artist:5ugVdZNXtMIj6ECTzGsyqS",
          },
        ],
        available_markets: [
          "AD",
          "AE",
          "AR",
          "AT",
          "AU",
          "BE",
          "BG",
          "BH",
          "BO",
          "BR",
          "CA",
          "CH",
          "CL",
          "CO",
          "CR",
          "CY",
          "CZ",
          "DE",
          "DK",
          "DO",
          "DZ",
          "EC",
          "EE",
          "EG",
          "ES",
          "FI",
          "FR",
          "GB",
          "GR",
          "GT",
          "HK",
          "HN",
          "HU",
          "ID",
          "IE",
          "IL",
          "IN",
          "IS",
          "IT",
          "JO",
          "JP",
          "KW",
          "LB",
          "LI",
          "LT",
          "LU",
          "LV",
          "MA",
          "MC",
          "MT",
          "MX",
          "MY",
          "NI",
          "NL",
          "NO",
          "NZ",
          "OM",
          "PA",
          "PE",
          "PH",
          "PL",
          "PS",
          "PT",
          "PY",
          "QA",
          "RO",
          "SA",
          "SE",
          "SG",
          "SK",
          "SV",
          "TH",
          "TN",
          "TR",
          "TW",
          "US",
          "UY",
          "VN",
          "ZA",
        ],
        disc_number: 1,
        duration_ms: 196986,
        explicit: false,
        external_ids: {
          isrc: "GBER71901876",
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/3s7m99pSJk34SFIU3oKUAA",
        },
        href: "https://api.spotify.com/v1/tracks/3s7m99pSJk34SFIU3oKUAA",
        id: "3s7m99pSJk34SFIU3oKUAA",
        is_local: false,
        name: "Weekend In Paradise",
        popularity: 62,
        preview_url:
          "https://p.scdn.co/mp3-preview/db25f9437866ee2530c72042c19649927375e0fd?cid=7116f40f98d64f5cbb9e2aafb2209702",
        track_number: 11,
        type: "track",
        uri: "spotify:track:3s7m99pSJk34SFIU3oKUAA",
      },
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/5ugVdZNXtMIj6ECTzGsyqS",
        },
        href: "https://api.spotify.com/v1/artists/5ugVdZNXtMIj6ECTzGsyqS",
        id: "5ugVdZNXtMIj6ECTzGsyqS",
        name: "JAMIE WEBSTER",
        type: "artist",
        uri: "spotify:artist:5ugVdZNXtMIj6ECTzGsyqS",
      },
      setName: "Jamie Webster",
    },
    Mahalia: {
      track: {
        album: {
          album_type: "SINGLE",
          artists: [
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/16rCzZOMQX7P8Kmn5YKexI",
              },
              href: "https://api.spotify.com/v1/artists/16rCzZOMQX7P8Kmn5YKexI",
              id: "16rCzZOMQX7P8Kmn5YKexI",
              name: "Mahalia",
              type: "artist",
              uri: "spotify:artist:16rCzZOMQX7P8Kmn5YKexI",
            },
          ],
          available_markets: [
            "AD",
            "AE",
            "AR",
            "AT",
            "AU",
            "BE",
            "BG",
            "BH",
            "BO",
            "BR",
            "CA",
            "CH",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DE",
            "DK",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HU",
            "ID",
            "IE",
            "IL",
            "IN",
            "IS",
            "IT",
            "JO",
            "JP",
            "KW",
            "LB",
            "LI",
            "LT",
            "LU",
            "LV",
            "MA",
            "MC",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PH",
            "PL",
            "PS",
            "PT",
            "PY",
            "QA",
            "RO",
            "SA",
            "SE",
            "SG",
            "SK",
            "SV",
            "TH",
            "TN",
            "TR",
            "TW",
            "US",
            "UY",
            "VN",
            "ZA",
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/7CJe1NJRPmK5et3uevNQw5",
          },
          href: "https://api.spotify.com/v1/albums/7CJe1NJRPmK5et3uevNQw5",
          id: "7CJe1NJRPmK5et3uevNQw5",
          images: [
            {
              height: 640,
              url: "https://i.scdn.co/image/ab67616d0000b27307953bd936c654a6244bb753",
              width: 640,
            },
            {
              height: 300,
              url: "https://i.scdn.co/image/ab67616d00001e0207953bd936c654a6244bb753",
              width: 300,
            },
            {
              height: 64,
              url: "https://i.scdn.co/image/ab67616d0000485107953bd936c654a6244bb753",
              width: 64,
            },
          ],
          name: "Terms and Conditions",
          release_date: "2023-04-05",
          release_date_precision: "day",
          total_tracks: 1,
          type: "album",
          uri: "spotify:album:7CJe1NJRPmK5et3uevNQw5",
        },
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/16rCzZOMQX7P8Kmn5YKexI",
            },
            href: "https://api.spotify.com/v1/artists/16rCzZOMQX7P8Kmn5YKexI",
            id: "16rCzZOMQX7P8Kmn5YKexI",
            name: "Mahalia",
            type: "artist",
            uri: "spotify:artist:16rCzZOMQX7P8Kmn5YKexI",
          },
        ],
        available_markets: [
          "AD",
          "AE",
          "AR",
          "AT",
          "AU",
          "BE",
          "BG",
          "BH",
          "BO",
          "BR",
          "CA",
          "CH",
          "CL",
          "CO",
          "CR",
          "CY",
          "CZ",
          "DE",
          "DK",
          "DO",
          "DZ",
          "EC",
          "EE",
          "EG",
          "ES",
          "FI",
          "FR",
          "GB",
          "GR",
          "GT",
          "HK",
          "HN",
          "HU",
          "ID",
          "IE",
          "IL",
          "IN",
          "IS",
          "IT",
          "JO",
          "JP",
          "KW",
          "LB",
          "LI",
          "LT",
          "LU",
          "LV",
          "MA",
          "MC",
          "MT",
          "MX",
          "MY",
          "NI",
          "NL",
          "NO",
          "NZ",
          "OM",
          "PA",
          "PE",
          "PH",
          "PL",
          "PS",
          "PT",
          "PY",
          "QA",
          "RO",
          "SA",
          "SE",
          "SG",
          "SK",
          "SV",
          "TH",
          "TN",
          "TR",
          "TW",
          "US",
          "UY",
          "VN",
          "ZA",
        ],
        disc_number: 1,
        duration_ms: 209682,
        explicit: true,
        external_ids: {
          isrc: "GBAHS2300032",
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/3vv2KJC3vaWPXXF5Ba7biE",
        },
        href: "https://api.spotify.com/v1/tracks/3vv2KJC3vaWPXXF5Ba7biE",
        id: "3vv2KJC3vaWPXXF5Ba7biE",
        is_local: false,
        name: "Terms and Conditions",
        popularity: 66,
        preview_url:
          "https://p.scdn.co/mp3-preview/5e10d80ade36f6b15da779baa122fdc647c1f035?cid=7116f40f98d64f5cbb9e2aafb2209702",
        track_number: 1,
        type: "track",
        uri: "spotify:track:3vv2KJC3vaWPXXF5Ba7biE",
      },
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/16rCzZOMQX7P8Kmn5YKexI",
        },
        href: "https://api.spotify.com/v1/artists/16rCzZOMQX7P8Kmn5YKexI",
        id: "16rCzZOMQX7P8Kmn5YKexI",
        name: "Mahalia",
        type: "artist",
        uri: "spotify:artist:16rCzZOMQX7P8Kmn5YKexI",
      },
      setName: "Mahalia",
    },
    Lizzo: {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/56oDRnqbIiwx4mymNEv7dS",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["escape room", "minnesota hip hop", "pop", "trap queen"],
        href: "https://api.spotify.com/v1/artists/56oDRnqbIiwx4mymNEv7dS",
        id: "56oDRnqbIiwx4mymNEv7dS",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb0d66b3670294bf801847dae2",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab676161000051740d66b3670294bf801847dae2",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f1780d66b3670294bf801847dae2",
            width: 160,
          },
        ],
        name: "Lizzo",
        popularity: 76,
        type: "artist",
        uri: "spotify:artist:56oDRnqbIiwx4mymNEv7dS",
      },
      setName: "Lizzo",
    },
    "Lf System": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/0HxX6imltnNXJyQhu4nsiO",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["uk dance"],
        href: "https://api.spotify.com/v1/artists/0HxX6imltnNXJyQhu4nsiO",
        id: "0HxX6imltnNXJyQhu4nsiO",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb2b623d7f34d92ada3644237f",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab676161000051742b623d7f34d92ada3644237f",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f1782b623d7f34d92ada3644237f",
            width: 160,
          },
        ],
        name: "LF SYSTEM",
        popularity: 64,
        type: "artist",
        uri: "spotify:artist:0HxX6imltnNXJyQhu4nsiO",
      },
      setName: "Lf System",
    },
    "Fred Again..": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4oLeXFyACqeem2VImYeBFe",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["edm", "house", "stutter house"],
        href: "https://api.spotify.com/v1/artists/4oLeXFyACqeem2VImYeBFe",
        id: "4oLeXFyACqeem2VImYeBFe",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb69eea22d7189af21794f3043",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab6761610000517469eea22d7189af21794f3043",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f17869eea22d7189af21794f3043",
            width: 160,
          },
        ],
        name: "Fred again..",
        popularity: 76,
        type: "artist",
        uri: "spotify:artist:4oLeXFyACqeem2VImYeBFe",
      },
      setName: "Fred Again..",
    },
    "Flowdan Live": {
      track: {
        album: {
          album_type: "ALBUM",
          artists: [
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/5he5w2lnU9x7JFhnwcekXX",
              },
              href: "https://api.spotify.com/v1/artists/5he5w2lnU9x7JFhnwcekXX",
              id: "5he5w2lnU9x7JFhnwcekXX",
              name: "Skrillex",
              type: "artist",
              uri: "spotify:artist:5he5w2lnU9x7JFhnwcekXX",
            },
          ],
          available_markets: [
            "AD",
            "AE",
            "AR",
            "AT",
            "AU",
            "BE",
            "BG",
            "BH",
            "BO",
            "BR",
            "CA",
            "CH",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DE",
            "DK",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HU",
            "ID",
            "IE",
            "IL",
            "IN",
            "IS",
            "IT",
            "JO",
            "JP",
            "KW",
            "LB",
            "LI",
            "LT",
            "LU",
            "LV",
            "MA",
            "MC",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PH",
            "PL",
            "PS",
            "PT",
            "PY",
            "QA",
            "RO",
            "SA",
            "SE",
            "SG",
            "SK",
            "SV",
            "TH",
            "TN",
            "TR",
            "TW",
            "US",
            "UY",
            "VN",
            "ZA",
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/7tWP3OG5dWphctKg4NMACt",
          },
          href: "https://api.spotify.com/v1/albums/7tWP3OG5dWphctKg4NMACt",
          id: "7tWP3OG5dWphctKg4NMACt",
          images: [
            {
              height: 640,
              url: "https://i.scdn.co/image/ab67616d0000b2736382f06498259682f91cf981",
              width: 640,
            },
            {
              height: 300,
              url: "https://i.scdn.co/image/ab67616d00001e026382f06498259682f91cf981",
              width: 300,
            },
            {
              height: 64,
              url: "https://i.scdn.co/image/ab67616d000048516382f06498259682f91cf981",
              width: 64,
            },
          ],
          name: "Quest For Fire",
          release_date: "2023-02-17",
          release_date_precision: "day",
          total_tracks: 15,
          type: "album",
          uri: "spotify:album:7tWP3OG5dWphctKg4NMACt",
        },
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/5he5w2lnU9x7JFhnwcekXX",
            },
            href: "https://api.spotify.com/v1/artists/5he5w2lnU9x7JFhnwcekXX",
            id: "5he5w2lnU9x7JFhnwcekXX",
            name: "Skrillex",
            type: "artist",
            uri: "spotify:artist:5he5w2lnU9x7JFhnwcekXX",
          },
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/4oLeXFyACqeem2VImYeBFe",
            },
            href: "https://api.spotify.com/v1/artists/4oLeXFyACqeem2VImYeBFe",
            id: "4oLeXFyACqeem2VImYeBFe",
            name: "Fred again..",
            type: "artist",
            uri: "spotify:artist:4oLeXFyACqeem2VImYeBFe",
          },
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/07CimrZi5vs9iEao47TNQ4",
            },
            href: "https://api.spotify.com/v1/artists/07CimrZi5vs9iEao47TNQ4",
            id: "07CimrZi5vs9iEao47TNQ4",
            name: "Flowdan",
            type: "artist",
            uri: "spotify:artist:07CimrZi5vs9iEao47TNQ4",
          },
        ],
        available_markets: [
          "AD",
          "AE",
          "AR",
          "AT",
          "AU",
          "BE",
          "BG",
          "BH",
          "BO",
          "BR",
          "CA",
          "CH",
          "CL",
          "CO",
          "CR",
          "CY",
          "CZ",
          "DE",
          "DK",
          "DO",
          "DZ",
          "EC",
          "EE",
          "EG",
          "ES",
          "FI",
          "FR",
          "GB",
          "GR",
          "GT",
          "HK",
          "HN",
          "HU",
          "ID",
          "IE",
          "IL",
          "IN",
          "IS",
          "IT",
          "JO",
          "JP",
          "KW",
          "LB",
          "LI",
          "LT",
          "LU",
          "LV",
          "MA",
          "MC",
          "MT",
          "MX",
          "MY",
          "NI",
          "NL",
          "NO",
          "NZ",
          "OM",
          "PA",
          "PE",
          "PH",
          "PL",
          "PS",
          "PT",
          "PY",
          "QA",
          "RO",
          "SA",
          "SE",
          "SG",
          "SK",
          "SV",
          "TH",
          "TN",
          "TR",
          "TW",
          "US",
          "UY",
          "VN",
          "ZA",
        ],
        disc_number: 1,
        duration_ms: 146571,
        explicit: false,
        external_ids: {
          isrc: "USAT22221613",
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/74fmYjFwt9CqEFAh8ybeBD",
        },
        href: "https://api.spotify.com/v1/tracks/74fmYjFwt9CqEFAh8ybeBD",
        id: "74fmYjFwt9CqEFAh8ybeBD",
        is_local: false,
        name: "Rumble",
        popularity: 72,
        preview_url:
          "https://p.scdn.co/mp3-preview/eb79af9f809883de0632f02388ec354478612754?cid=7116f40f98d64f5cbb9e2aafb2209702",
        track_number: 4,
        type: "track",
        uri: "spotify:track:74fmYjFwt9CqEFAh8ybeBD",
      },
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/07CimrZi5vs9iEao47TNQ4",
        },
        href: "https://api.spotify.com/v1/artists/07CimrZi5vs9iEao47TNQ4",
        id: "07CimrZi5vs9iEao47TNQ4",
        name: "Flowdan",
        type: "artist",
        uri: "spotify:artist:07CimrZi5vs9iEao47TNQ4",
      },
      setName: "Flowdan Live",
    },
    "Arctic Monkeys": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: [
          "garage rock",
          "modern rock",
          "permanent wave",
          "rock",
          "sheffield indie",
        ],
        href: "https://api.spotify.com/v1/artists/7Ln80lUS6He07XvHI8qqHH",
        id: "7Ln80lUS6He07XvHI8qqHH",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab676161000051747da39dea0a72f581535fb11f",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f1787da39dea0a72f581535fb11f",
            width: 160,
          },
        ],
        name: "Arctic Monkeys",
        popularity: 86,
        type: "artist",
        uri: "spotify:artist:7Ln80lUS6He07XvHI8qqHH",
      },
      setName: "Arctic Monkeys",
    },
    Prospa: {
      track: {
        album: {
          album_type: "SINGLE",
          artists: [
            {
              external_urls: {
                spotify:
                  "https://open.spotify.com/artist/6HabM2PUM519iIxervGWSb",
              },
              href: "https://api.spotify.com/v1/artists/6HabM2PUM519iIxervGWSb",
              id: "6HabM2PUM519iIxervGWSb",
              name: "Prospa",
              type: "artist",
              uri: "spotify:artist:6HabM2PUM519iIxervGWSb",
            },
          ],
          available_markets: [
            "AD",
            "AE",
            "AR",
            "AT",
            "AU",
            "BE",
            "BG",
            "BH",
            "BO",
            "BR",
            "CA",
            "CH",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DE",
            "DK",
            "DO",
            "DZ",
            "EC",
            "EE",
            "EG",
            "ES",
            "FI",
            "FR",
            "GB",
            "GR",
            "GT",
            "HK",
            "HN",
            "HU",
            "ID",
            "IE",
            "IL",
            "IN",
            "IS",
            "IT",
            "JO",
            "JP",
            "KW",
            "LB",
            "LI",
            "LT",
            "LU",
            "LV",
            "MA",
            "MC",
            "MT",
            "MX",
            "MY",
            "NI",
            "NL",
            "NO",
            "NZ",
            "OM",
            "PA",
            "PE",
            "PH",
            "PL",
            "PS",
            "PT",
            "PY",
            "QA",
            "RO",
            "SA",
            "SE",
            "SG",
            "SK",
            "SV",
            "TH",
            "TN",
            "TR",
            "TW",
            "US",
            "UY",
            "VN",
            "ZA",
          ],
          external_urls: {
            spotify: "https://open.spotify.com/album/4IMEWyvS2r1mpnTYD8j4Sb",
          },
          href: "https://api.spotify.com/v1/albums/4IMEWyvS2r1mpnTYD8j4Sb",
          id: "4IMEWyvS2r1mpnTYD8j4Sb",
          images: [
            {
              height: 640,
              url: "https://i.scdn.co/image/ab67616d0000b273aaa3a9bdb4f294a7343f799f",
              width: 640,
            },
            {
              height: 300,
              url: "https://i.scdn.co/image/ab67616d00001e02aaa3a9bdb4f294a7343f799f",
              width: 300,
            },
            {
              height: 64,
              url: "https://i.scdn.co/image/ab67616d00004851aaa3a9bdb4f294a7343f799f",
              width: 64,
            },
          ],
          name: "Ecstasy (Over & Over)",
          release_date: "2020-05-15",
          release_date_precision: "day",
          total_tracks: 1,
          type: "album",
          uri: "spotify:album:4IMEWyvS2r1mpnTYD8j4Sb",
        },
        artists: [
          {
            external_urls: {
              spotify: "https://open.spotify.com/artist/6HabM2PUM519iIxervGWSb",
            },
            href: "https://api.spotify.com/v1/artists/6HabM2PUM519iIxervGWSb",
            id: "6HabM2PUM519iIxervGWSb",
            name: "Prospa",
            type: "artist",
            uri: "spotify:artist:6HabM2PUM519iIxervGWSb",
          },
        ],
        available_markets: [
          "AD",
          "AE",
          "AR",
          "AT",
          "AU",
          "BE",
          "BG",
          "BH",
          "BO",
          "BR",
          "CA",
          "CH",
          "CL",
          "CO",
          "CR",
          "CY",
          "CZ",
          "DE",
          "DK",
          "DO",
          "DZ",
          "EC",
          "EE",
          "EG",
          "ES",
          "FI",
          "FR",
          "GB",
          "GR",
          "GT",
          "HK",
          "HN",
          "HU",
          "ID",
          "IE",
          "IL",
          "IN",
          "IS",
          "IT",
          "JO",
          "JP",
          "KW",
          "LB",
          "LI",
          "LT",
          "LU",
          "LV",
          "MA",
          "MC",
          "MT",
          "MX",
          "MY",
          "NI",
          "NL",
          "NO",
          "NZ",
          "OM",
          "PA",
          "PE",
          "PH",
          "PL",
          "PS",
          "PT",
          "PY",
          "QA",
          "RO",
          "SA",
          "SE",
          "SG",
          "SK",
          "SV",
          "TH",
          "TN",
          "TR",
          "TW",
          "US",
          "UY",
          "VN",
          "ZA",
        ],
        disc_number: 1,
        duration_ms: 216796,
        explicit: false,
        external_ids: {
          isrc: "GBUM72001712",
        },
        external_urls: {
          spotify: "https://open.spotify.com/track/2nHBfIdQ4ndFNaWilLdBUN",
        },
        href: "https://api.spotify.com/v1/tracks/2nHBfIdQ4ndFNaWilLdBUN",
        id: "2nHBfIdQ4ndFNaWilLdBUN",
        is_local: false,
        name: "Ecstasy (Over & Over)",
        popularity: 52,
        preview_url:
          "https://p.scdn.co/mp3-preview/62b7cf8810f2f262ea54fdfd25ba61a6d09754c4?cid=7116f40f98d64f5cbb9e2aafb2209702",
        track_number: 1,
        type: "track",
        uri: "spotify:track:2nHBfIdQ4ndFNaWilLdBUN",
      },
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/6HabM2PUM519iIxervGWSb",
        },
        href: "https://api.spotify.com/v1/artists/6HabM2PUM519iIxervGWSb",
        id: "6HabM2PUM519iIxervGWSb",
        name: "Prospa",
        type: "artist",
        uri: "spotify:artist:6HabM2PUM519iIxervGWSb",
      },
      setName: "Prospa",
    },
    "Yusuf / Cat Stevens": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/08F3Y3SctIlsOEmKd6dnH8",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: [
          "british folk",
          "classic rock",
          "folk",
          "folk rock",
          "mellow gold",
          "singer-songwriter",
        ],
        href: "https://api.spotify.com/v1/artists/08F3Y3SctIlsOEmKd6dnH8",
        id: "08F3Y3SctIlsOEmKd6dnH8",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebcff97c36c1d9a2a1d421966c",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174cff97c36c1d9a2a1d421966c",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178cff97c36c1d9a2a1d421966c",
            width: 160,
          },
        ],
        name: "Yusuf / Cat Stevens",
        popularity: 70,
        type: "artist",
        uri: "spotify:artist:08F3Y3SctIlsOEmKd6dnH8",
      },
      setName: "Yusuf / Cat Stevens",
    },
    "Lewis Capaldi": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4GNC7GD6oZMSxPGyXy4MNB",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["pop", "uk pop"],
        href: "https://api.spotify.com/v1/artists/4GNC7GD6oZMSxPGyXy4MNB",
        id: "4GNC7GD6oZMSxPGyXy4MNB",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebea7538654040e553a7b0fc28",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174ea7538654040e553a7b0fc28",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178ea7538654040e553a7b0fc28",
            width: 160,
          },
        ],
        name: "Lewis Capaldi",
        popularity: 82,
        type: "artist",
        uri: "spotify:artist:4GNC7GD6oZMSxPGyXy4MNB",
      },
      setName: "Lewis Capaldi",
    },
    "Tom Grennan": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/5SHxzwjek1Pipl1Yk11UHv",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["uk pop"],
        href: "https://api.spotify.com/v1/artists/5SHxzwjek1Pipl1Yk11UHv",
        id: "5SHxzwjek1Pipl1Yk11UHv",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb350e08875f71daca62024041",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174350e08875f71daca62024041",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178350e08875f71daca62024041",
            width: 160,
          },
        ],
        name: "Tom Grennan",
        popularity: 69,
        type: "artist",
        uri: "spotify:artist:5SHxzwjek1Pipl1Yk11UHv",
      },
      setName: "Tom Grennan",
    },
    "Confidence Man (DJ Set)": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/0RwXnFrEoI8tltFvYpJgP6",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["australian electropop"],
        href: "https://api.spotify.com/v1/artists/0RwXnFrEoI8tltFvYpJgP6",
        id: "0RwXnFrEoI8tltFvYpJgP6",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebf8cb140afe6a47520088581d",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174f8cb140afe6a47520088581d",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178f8cb140afe6a47520088581d",
            width: 160,
          },
        ],
        name: "Confidence Man",
        popularity: 48,
        type: "artist",
        uri: "spotify:artist:0RwXnFrEoI8tltFvYpJgP6",
      },
      setName: "Confidence Man (DJ Set)",
    },
    "Ben Howard": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/5schNIzWdI9gJ1QRK8SBnc",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["british singer-songwriter", "folk-pop"],
        href: "https://api.spotify.com/v1/artists/5schNIzWdI9gJ1QRK8SBnc",
        id: "5schNIzWdI9gJ1QRK8SBnc",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb5aaa4c336f25c59cd9b1825a",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab676161000051745aaa4c336f25c59cd9b1825a",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f1785aaa4c336f25c59cd9b1825a",
            width: 160,
          },
        ],
        name: "Ben Howard",
        popularity: 65,
        type: "artist",
        uri: "spotify:artist:5schNIzWdI9gJ1QRK8SBnc",
      },
      setName: "Ben Howard",
    },
    "Elton John": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/3PhoLpVuITZKcymswpck5b",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["glam rock", "mellow gold", "piano rock", "rock"],
        href: "https://api.spotify.com/v1/artists/3PhoLpVuITZKcymswpck5b",
        id: "3PhoLpVuITZKcymswpck5b",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb0a7388b95df960b5c0da8970",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab676161000051740a7388b95df960b5c0da8970",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f1780a7388b95df960b5c0da8970",
            width: 160,
          },
        ],
        name: "Elton John",
        popularity: 83,
        type: "artist",
        uri: "spotify:artist:3PhoLpVuITZKcymswpck5b",
      },
      setName: "Elton John",
    },
    "Barry Can't Swim": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/0vTVU0KH0CVzijsoKGsTPl",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: [],
        href: "https://api.spotify.com/v1/artists/0vTVU0KH0CVzijsoKGsTPl",
        id: "0vTVU0KH0CVzijsoKGsTPl",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebd81928154288fe971461b05d",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174d81928154288fe971461b05d",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178d81928154288fe971461b05d",
            width: 160,
          },
        ],
        name: "Barry Can't Swim",
        popularity: 56,
        type: "artist",
        uri: "spotify:artist:0vTVU0KH0CVzijsoKGsTPl",
      },
      setName: "Barry Can't Swim",
    },
    "Christine and the Queens": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/04vj3iPUiVh5melWr0w3xT",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: [
          "art pop",
          "electro-pop francais",
          "metropopolis",
          "shimmer pop",
        ],
        href: "https://api.spotify.com/v1/artists/04vj3iPUiVh5melWr0w3xT",
        id: "04vj3iPUiVh5melWr0w3xT",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb307f3c17453f6bdef2f0d6eb",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174307f3c17453f6bdef2f0d6eb",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178307f3c17453f6bdef2f0d6eb",
            width: 160,
          },
        ],
        name: "Christine and the Queens",
        popularity: 61,
        type: "artist",
        uri: "spotify:artist:04vj3iPUiVh5melWr0w3xT",
      },
      setName: "Christine and the Queens",
    },
    "The Teskey Brothers": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/2nTjd2lNo1GVEfXM3bCnsh",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["australian americana"],
        href: "https://api.spotify.com/v1/artists/2nTjd2lNo1GVEfXM3bCnsh",
        id: "2nTjd2lNo1GVEfXM3bCnsh",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb948469f639894aab9360afac",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174948469f639894aab9360afac",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178948469f639894aab9360afac",
            width: 160,
          },
        ],
        name: "The Teskey Brothers",
        popularity: 62,
        type: "artist",
        uri: "spotify:artist:2nTjd2lNo1GVEfXM3bCnsh",
      },
      setName: "The Teskey Brothers",
    },
    Blondie: {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/4tpUmLEVLCGFr93o8hFFIB",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: [
          "candy pop",
          "new wave pop",
          "permanent wave",
          "power pop",
          "rock",
        ],
        href: "https://api.spotify.com/v1/artists/4tpUmLEVLCGFr93o8hFFIB",
        id: "4tpUmLEVLCGFr93o8hFFIB",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb67dc4da82c968767d994f3c3",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab6761610000517467dc4da82c968767d994f3c3",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f17867dc4da82c968767d994f3c3",
            width: 160,
          },
        ],
        name: "Blondie",
        popularity: 69,
        type: "artist",
        uri: "spotify:artist:4tpUmLEVLCGFr93o8hFFIB",
      },
      setName: "Blondie",
    },
    "Lana Del Rey": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/00FQb4jTyendYWaN8pK0wa",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["art pop", "pop"],
        href: "https://api.spotify.com/v1/artists/00FQb4jTyendYWaN8pK0wa",
        id: "00FQb4jTyendYWaN8pK0wa",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebb99cacf8acd5378206767261",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174b99cacf8acd5378206767261",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178b99cacf8acd5378206767261",
            width: 160,
          },
        ],
        name: "Lana Del Rey",
        popularity: 91,
        type: "artist",
        uri: "spotify:artist:00FQb4jTyendYWaN8pK0wa",
      },
      setName: "Lana Del Rey",
    },
    Texas: {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/5JsdVATHNPE0XdMFMRoSuf",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["new romantic", "new wave pop", "scottish rock"],
        href: "https://api.spotify.com/v1/artists/5JsdVATHNPE0XdMFMRoSuf",
        id: "5JsdVATHNPE0XdMFMRoSuf",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebd58e352c6bc134d6967d5b11",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174d58e352c6bc134d6967d5b11",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178d58e352c6bc134d6967d5b11",
            width: 160,
          },
        ],
        name: "Texas",
        popularity: 56,
        type: "artist",
        uri: "spotify:artist:5JsdVATHNPE0XdMFMRoSuf",
      },
      setName: "Texas",
    },
    "Fever Ray": {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/5hE6NCoobhyEu6TRSbjOJY",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: [
          "alternative dance",
          "art pop",
          "dark pop",
          "electronica",
          "neo-synthpop",
          "swedish electropop",
          "swedish synth",
          "swedish synthpop",
        ],
        href: "https://api.spotify.com/v1/artists/5hE6NCoobhyEu6TRSbjOJY",
        id: "5hE6NCoobhyEu6TRSbjOJY",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb378026e008575db882ae6f3f",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174378026e008575db882ae6f3f",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178378026e008575db882ae6f3f",
            width: 160,
          },
        ],
        name: "Fever Ray",
        popularity: 52,
        type: "artist",
        uri: "spotify:artist:5hE6NCoobhyEu6TRSbjOJY",
      },
      setName: "Fever Ray",
    },
    Cmat: {
      artist: {
        external_urls: {
          spotify: "https://open.spotify.com/artist/3VBNIRx1LxVdRqOiPgkLwv",
        },
        followers: {
          href: null,
          total: 0,
        },
        genres: ["irish rock", "modern alternative pop"],
        href: "https://api.spotify.com/v1/artists/3VBNIRx1LxVdRqOiPgkLwv",
        id: "3VBNIRx1LxVdRqOiPgkLwv",
        images: [
          {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5ebae3baa3b623fe5ca8f95b6a8",
            width: 640,
          },
          {
            height: 320,
            url: "https://i.scdn.co/image/ab67616100005174ae3baa3b623fe5ca8f95b6a8",
            width: 320,
          },
          {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f178ae3baa3b623fe5ca8f95b6a8",
            width: 160,
          },
        ],
        name: "CMAT",
        popularity: 44,
        type: "artist",
        uri: "spotify:artist:3VBNIRx1LxVdRqOiPgkLwv",
      },
      setName: "Cmat",
    },
  };

  // console.log(JSON.stringify(itineraryInDays, null, 3));
  // console.log(`loadingSpotifyData=${loadingSpotifyData}`);

  useEffect(() => {
    // console.log(`spotifyKeys=${spotifyKeys}`);
    const initSpotify = async () => {
      const hashParams = new URLSearchParams(window.location.search);
      const code = hashParams.get("code");
      console.log("Initialising...");
      if (!!spotifyKeys?.access_token || code) {
        console.log("Initialising..., getting spotify user");
        sdk.currentUser
          .profile()
          .then((user) => {
            console.log("Initialising..., got spotify user");
            setUser(user);
            console.log(`Spotify User Information\n${JSON.stringify(user)}`);
            setInitialLoadDone(true);
            fetchAll();
          })
          .catch((error) => {
            console.error("Initialising..., Failed to get spotify user");
            setUser(undefined);
            setInitialLoadDone(true);
            console.error(error);
          });
      } else {
        console.log(
          "Initialising..., skipping get spotify user, no token detected"
        );
        setUser(undefined);
        setInitialLoadDone(true);
      }
    };
    initSpotify();
  }, []);

  return intialLoadDone ? (
    <main className="flex min-h-screen w-full flex-col items-center justify-start">
      <div className="self-end pr-2 pt-2 h-6">
        {user && (
          <a
            className="text-xs font-medium hover:underline dark:text-cyan-500"
            href="#"
            onClick={logout}
          >
            <p>Unlink Spotify</p>
          </a>
        )}
      </div>
      <div className={"flex flex-col px-5 py-5 flex-grow"}>
        <div
          id={"header"}
          className="relative flex place-items-center flex-col mb-5"
        >
          <img alt="disc logo" src="/disc.png" width="25" />
          <h1 className={`text-3xl font-semibold text-center`}>The Set Menu</h1>
          <div>
            <p className={`text-xs text-center opacity-50`}>
              {"You can't remember every artists name"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center flex-grow justify-start">
          {!user && (
            <div>
              <h5 className="text-l lg:text-5xl drop-shadow-2xl font-bold text-center tracking-tight text-gray-900 dark:text-white">
                {"Use your Spotify history to discover your"}
              </h5>
              <h5 className="text-l lg:text-5xl drop-shadow-2xl font-bold text-center tracking-tight text-gray-900 dark:text-white">
                {"Glasto 24 Set Menu"}
              </h5>
            </div>
          )}

          {/* <div id={"chooseFestival"} className={'justify-self-center pt-10'}>
                    <h2 className={`text-m font-semibold opacity-50 text-left`}>
                              Choose your festival
                          </h2>
                    <div
                      className="mb-2 flex flex-col group rounded-lg border border-transparent px-5 py-4 text-center bg-neutral-800 bg-opacity-50 hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
                              >
                        <div className={`text-m font-semibold opacity-80`}>
                        </div>
                            <img src='/glasto.png' width="200" height="50"/>
                            <div className={`text-sm font-semibold `}>
                              Glastonbury 2024
                          </div>
                    </div>
                    <h2 className={`m-0 text-xs text-center opacity-50`}>
                        More festivals coming soon...           
                    </h2>
                  </div> */}

          {!user && (
            <div id={"connectAccount"} className={"justify-self-center pt-10"}>
              <h2
                className={`text-m font-semibold opacity-50 text-center pb-3`}
              >
                Connect your account using
              </h2>

              <Button color="dark" onClick={performSpotifyAuth}>
                <img
                  alt="spotify logo"
                  src="/spotifylogo.png"
                  width="200"
                  height="50"
                />
              </Button>
              <h2 className={`text-xs text-center opacity-50 pt-1`}>
                No data leaves your device
              </h2>
            </div>
          )}

          {user && (
            <Itinerary
              itineraryInDays={itineraryInDays}
              favoriteArtists={favoriteArtists}
              loadingSpotifyData={loadingSpotifyData}
              recommendationsEnabled={recommendationsEnabled}
              setRecommendationsEnabled={setRecommendationsEnabled}
            />
          )}
          {!user && (
            <div className="opacity-60 pt-10 wave-box mb-20">
              <h2
                className={`text-m font-semibold opacity-50 text-center pb-3`}
              >
                Example Set Menu
              </h2>
              <Itinerary
                itineraryInDays={dummyItinearryInDays}
                favoriteArtists={dummyFavouriteArtists}
                loadingSpotifyData={false}
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 pt-5 justify-center">
          {user && (
            <>
              <h2 className={`text-m font-semibold opacity-50 text-center`}>
                If you liked this then
              </h2>
              <Button color="dark" onClick={share}>
                <h1 className={`text-m font-semibold text-center`}>Share</h1>
              </Button>
              <h2 className={`text-m font-semibold opacity-50 text-center`}>
                it with your mates
              </h2>
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  ) : (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
      <Spinner aria-label="Extra large spinner example" size="xl" />
    </main>
  );
}
