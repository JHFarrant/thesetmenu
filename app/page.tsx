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
import spotifyIDs2Acts from "../public/g2024SpotifyIDs.json";
import rawEvents from "../public/g2024.json";
import moment from "moment";
import { Button, Card, Spinner } from "flowbite-react";
import { useReadLocalStorage } from "usehooks-ts";
import Footer from "../components/footer";
import Itinerary from "../components/itinerary";
import Header from "../components/header";
import { DummyItinearryInDays, DummyFavouriteArtists } from "./consts";
import { shiftedDay } from "../components/itinerary";

import testTopArtists from "../testData/jack/topArtists.json";
import testTopTracks from "../testData/jack/topTracks.json";
import testFollows from "../testData/jack/follows.json";

const USE_TEST_SPOTIFY_DATA =
  process.env.NEXT_PUBLIC_USE_TEST_SPOTIFY_DATA == "true";

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
          title: "My Glasto Set Menu",
          url: "https://myglastosetmenu.co.uk/",
        })
        .then(() => {
          console.log("Share success");
        })
        .catch(console.error);
    } else {
      console.log("Native sharing unavailable");
      window.open(
        "whatsapp://send?text=My Glasto Set Menu - https://myglastosetmenu.co.uk/"
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

    if (USE_TEST_SPOTIFY_DATA) {
      setTopArtists(testTopArtists as Artist[]);
      setTopTracks(testTopTracks as TrackWithAlbum[]);
      setFollows(testFollows as Artist[]);
    } else {
      setArtistsLoading(true);
      setTopArtists([]);
      fetchArtists().catch(console.error);

      setTracksLoading(true);
      setTopTracks([]);
      fetchTracks().catch(console.error);

      setFollowsLoading(true);
      setFollows([]);
      fetchFollows().catch(console.error);
    }
  };
  const spotifyIDs2ActsIncludingRecommendations: any = spotifyIDs2Acts;
  const spotifyIDs2ActsWithoutRecommendations: any = Object.entries(
    spotifyIDs2Acts
  ).reduce(
    (filteredSpotifyIds: any, [id, value]: [string, any]) => ({
      ...filteredSpotifyIds,
      ...(value.related_artist_name === null ? { [id]: value } : {}),
    }),
    {}
  );

  const spotifyIDsIncludingRecommendations = Object.keys(
    spotifyIDs2ActsIncludingRecommendations
  );
  const spotifyIDsWithoutRecommendations: any = Object.keys(
    spotifyIDs2ActsWithoutRecommendations
  );

  // console.log(JSON.stringify(spotifyIDs, null, 3));
  const matchedArtists = topArtists
    .filter((a) => spotifyIDsWithoutRecommendations.includes(a.id))
    .reduce((artists, a) => {
      const matchedArtist = spotifyIDs2ActsWithoutRecommendations[a.id];
      return {
        ...artists,
        [matchedArtist.act_name]: {
          artist: matchedArtist.act_artist_data,
          setName: matchedArtist.act_name,
          relatedArtistName: matchedArtist.related_artist_name,
        },
      };
    }, {});

  const matchedFollows = follows
    .filter((a) => spotifyIDsWithoutRecommendations.includes(a.id))
    .reduce((artists, a) => {
      const matchedArtist = spotifyIDs2ActsWithoutRecommendations[a.id];
      return {
        ...artists,
        [matchedArtist.act_name]: {
          artist: matchedArtist.act_artist_data,
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
          const matchedArtist = spotifyIDs2ActsWithoutRecommendations[a.id];
          return {
            ...trackArtists,
            [matchedArtist.act_name]: {
              track: t,
              artist: matchedArtist.act_artist_data,
              setName: matchedArtist.act_name,
              relatedArtistName: null,
            },
          };
        }, {}),
    }),
    {}
  );

  const matchedRecommendedArtists = recommendationsEnabled
    ? topArtists
        .filter((a) => spotifyIDsIncludingRecommendations.includes(a.id))
        .reduce((artists, a) => {
          const matchedArtist = spotifyIDs2ActsIncludingRecommendations[a.id];
          return {
            ...artists,
            [matchedArtist.act_name]: {
              artist: matchedArtist.act_artist_data,
              setName: matchedArtist.act_name,
              relatedArtistName: matchedArtist.related_artist_name,
            },
          };
        }, {})
    : {};

  const matchedRecommendedFollows = recommendationsEnabled
    ? follows
        .filter((a) => spotifyIDsIncludingRecommendations.includes(a.id))
        .reduce((artists, a) => {
          const matchedArtist = spotifyIDs2ActsIncludingRecommendations[a.id];
          return {
            ...artists,
            [matchedArtist.act_name]: {
              artist: matchedArtist.act_artist_data,
              setName: matchedArtist.act_name,
              relatedArtistName: matchedArtist.related_artist_name,
            },
          };
        }, {})
    : {};

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
    ...matchedRecommendedArtists,
    ...matchedRecommendedFollows,
    ...matchedArtistsWithTracks,
    ...matchedArtists,
    ...matchedFollows,
  };

  const eventsByTime = extractEventsByTime(rawEvents);
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

  // console.log(JSON.stringify(itineraryInDays, null, 3));
  // console.log(JSON.stringify(favoriteArtists, null, 3))

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
    if (USE_TEST_SPOTIFY_DATA) {
      setUser(true);
      setInitialLoadDone(true);
      fetchAll();
    } else {
      initSpotify();
    }
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
      <div className={"flex flex-col px-3 py-3 flex-grow"}>
        <Header />
        <div className="flex flex-col flex-grow justify-start">
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
            <div
              id={"connectAccount"}
              className={"flex flex-col justify-self-center pt-10"}
            >
              <h2
                className={`text-m font-semibold opacity-50 text-center pb-3`}
              >
                Sign in with your spotify account to get started
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
                No data leaves your web browser
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
                itineraryInDays={DummyItinearryInDays}
                favoriteArtists={DummyFavouriteArtists}
                loadingSpotifyData={false}
                demoMode={true}
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 pt-5 justify-center">
          {/*          {user && (
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
          )}*/}
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
