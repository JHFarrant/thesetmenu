"use client";

import {
  Card,
  Spinner,
  Badge,
  ToggleSwitch,
  Tooltip,
  Button,
  Drawer,
  Header,
  Items,
  Blockquote,
} from "flowbite-react";
import {
  HiInformationCircle,
  HiOutlineChatAlt2,
  HiOutlinePaperAirplane,
} from "react-icons/hi";
import { useState } from "react";

import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";

import { Favorite } from "@/types";
import RecommendationsEndpoints from "@spotify/web-api-ts-sdk/dist/mjs/endpoints/RecommendationsEndpoints";
import ArtistSelect from "../components/artistSelect";
import WhatsappText from "../components/whatsappText";

const TIME_SHIFT = 6; // hours

export const shiftedDay = (dateTime: moment.Moment) => {
  let out = dateTime.clone();
  out.subtract(TIME_SHIFT, "hours").startOf("day");
  return out;
};

// const testLink = "https://wa.me/?text=%F0%9F%93%80%20MyGlastoSetMenu.co.uk%0A%0A%F0%9F%8D%84%20%2AThursday%2A%20%F0%9F%8D%84%0A%3E%20%6014%3A00%60%20Barry%20Can%27t%20Swim%20%40%20_Park%20Stage_%0A%3E%20%6019%3A45%60%20Alogte%20Oho%20%26%20His%20Sounds%20of%20Joy%20%40%20_Pyramid%20Stage_%0A%0A%F0%9F%A6%84%20%2AFriday%2A%20%F0%9F%A6%84%0A%3E%20%6014%3A00%60%20Barry%20Can%27t%20Swim%20%40%20_Park%20Stage_%0A%3E%20%6019%3A45%60%20Alogte%20Oho%20%26%20His%20Sounds%20of%20Joy%20%40%20_Pyramid%20Stage_%0A%3E%20%6014%3A15%60%20Confidence%20Man%20%40%20_West%20Holts_%0A%3E%20%6019%3A45%60%20Alogte%20Oho%20%26%20His%20Sounds%20of%20Joy%20%40%20_Pyramid%20Stage_%0A%0A%F0%9F%8E%B8%20%2ASaturday%2A%20%F0%9F%8E%B8%0A%3E%20%6014%3A00%60%20Barry%20Can%27t%20Swim%20%40%20_Park%20Stage_%0A%3E%20%6014%3A15%60%20Confidence%20Man%20%40%20_West%20Holts_%0A%3E%20%6019%3A45%60%20Alogte%20Oho%20%26%20His%20Sounds%20of%20Joy%20%40%20_Pyramid%20Stage_%0A%0A%F0%9F%8E%A4%20%2ASunday%2A%20%F0%9F%8E%A4%0A%3E%20%6014%3A00%60%20Barry%20Can%27t%20Swim%20%40%20_The%20Park%20Stage_%0A%3E%20%6019%3A45%60%20Alogte%20Oho%20%26%20His%20Sounds%20of%20Joy%20%40%20_Pyramid%20Stage_%0A%3E%20%6014%3A15%60%20Confidence%20Man%20%40%20_West%20Holts_%0A%3E%20%6019%3A45%60%20Alogte%20Oho%20%26%20His%20Sounds%20of%20Joy%20%40%20_Pyramid%20Stage_%0A%3E%20%6014%3A15%60%20Confidence%20Man%20%40%20_West%20Holts_"
const getImage = (favourite: Favorite): Image => {
  // console.log(favourite);
  const artistImage =
    favourite.artist.images &&
    favourite.artist.images.find((i: Image) => i.width <= 600);
  if (artistImage) {
    return artistImage;
  }
  const albumImage =
    favourite.track?.album?.images &&
    favourite.track.album.images.find((i: Image) => i.width <= 600);
  return albumImage || { url: "disc.png", width: 512, height: 512 };
};

export const customThemeToggleSwitch: CustomFlowbiteTheme["toggleSwitch"] = {
  toggle: {
    base: "after:rounded-full rounded-full border group-focus:ring-4 group-focus:ring-cyan-500/25",
    checked: {
      on: "after:bg-white after:translate-x-full",
      off: "after:bg-gray-400 dark:after:bg-gray-500 border-gray-200 bg-gray-200 dark:border-gray-600 dark:bg-gray-700",
    },
  },
};

const Itinearry = ({
  itineraryInDays,
  favoriteArtists,
  loadingSpotifyData,
  recommendationsEnabled,
  setRecommendationsEnabled,
  demoMode,
}: any) => {
  const [selectedEvents, setSelectedEvents] = useState({});
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [drawerOpenedAtLeastOnce, setDrawerOpenedAtLeastOnce] = useState(false);

  const toggleSelectedState = (id) => {
    const currentState = selectedEvents[id];
    const nextState =
      (currentState ?? "unselected") == "unselected"
        ? "selected"
        : "unselected";
    setSelectedEvents({ ...selectedEvents, [id]: nextState });
  };

  const atLeastOneSelected = Object.values(selectedEvents).some(
    (e) => e == "selected"
  );
  if (atLeastOneSelected && !drawerOpenedAtLeastOnce) {
    setDrawerOpenedAtLeastOnce(true);
    setShowShareDrawer(true);
  }
  if (!atLeastOneSelected && showShareDrawer) {
    setShowShareDrawer(false);
    setDrawerOpenedAtLeastOnce(false);
  }

  return (
    <>
      <Card className={showShareDrawer ? "mb-20" : ""}>
        {/*      <div className="flex items-center justify-center">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {"Your Glasto Set Menu 🔥"}
        </h5>
      </div>*/}
        {/*      {!!setRecommendationsEnabled && (
        <div className="min-w-150">
          <ToggleSwitch
            color={"success"}
            theme={customThemeToggleSwitch}
            checked={recommendationsEnabled}
            label="Suggest similar artists"
            onChange={() => setRecommendationsEnabled(!recommendationsEnabled)}
          />
        </div>
      )}*/}
        <div className="flow-root">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {itineraryInDays.map((dailyItinerary: any) => {
              const date = shiftedDay(dailyItinerary[0]?.start);
              return (
                <div key={`DayHeader-${date}`}>
                  <li className="py-3 sm:py-4">
                    <div className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
                      {date?.format("dddd")}
                    </div>
                  </li>
                  {dailyItinerary.map((event: any) => {
                    const favourite = favoriteArtists[event.name];
                    return (
                      <li key={event.id} className="py-3 sm:py-4">
                        <div id="artistListItem" className="flex space-x-2 p-1">
                          <div id="artistImage" className="shrink-0">
                            <img
                              alt={favourite.artist.name}
                              src={getImage(favourite).url}
                              width="100"
                            />
                          </div>
                          <div
                            id="artistInfo"
                            className="flex flex-col space-y-2 items-left w-full justify-between"
                          >
                            {/* <div className='flex' > */}
                            <div className="flex flex-col">
                              <div>
                                <p className="text-sm font-medium text-left   text-gray-900 dark:text-white">
                                  {favourite.setName}
                                </p>
                              </div>
                              <div className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
                                {/* {eventsByArtist[favourite.setName]?.events.map( */}
                                {/* (e: any) => ( */}
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {event.location}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {event.start.format("ddd")}{" "}
                                  {event.start.format("h:mma")}
                                </p>
                                {/* ) */}
                                {/* )} */}
                              </div>
                            </div>
                            <div className="flex w-full justify-between items-center space-x-2">
                              <div id="spotifyIconArtistLink">
                                <a
                                  href={
                                    !demoMode &&
                                    favourite.artist.external_urls.spotify
                                  }
                                >
                                  <img
                                    alt={favourite.artist.name}
                                    // className="rounded-full"
                                    // height="32"
                                    src="spotifylogosmallblack.png"
                                    width="25"
                                  />
                                </a>
                              </div>
                              {!demoMode && (
                                <ArtistSelect
                                  selectionState={selectedEvents[event.id]}
                                  toggleSelected={() =>
                                    toggleSelectedState(event.id)
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full justify-start items-end space-x-2">
                          {favourite.relatedArtistName && (
                            <div id="whyRecommendationBadge">
                              <Tooltip
                                content={`Recommended because you listen to ${favourite.relatedArtistName}`}
                              >
                                <Badge icon={HiInformationCircle} color="info">
                                  {"Recommended for you, why?"}
                                </Badge>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </div>
              );
            })}
            {/* {!!user && !topArtists.length && !loadingSpotifyData &&  <div id={"connectAccount"} className={'flex flex-col align-center py-10'}>
  

  <Button color="dark" onClick={fetchAll}>                    
  <h2 className={`text-m font-semibold text-center`}>
          Load your Set Menu
      </h2>              
      </Button>
</div>
} */}
            {loadingSpotifyData && (
              <div className="flex justify-center py-10">
                <Spinner aria-label="Extra large spinner example" size="xl" />
              </div>
            )}
            {!itineraryInDays.length && (
              <li className="py-3 sm:py-4">
                <div className="flex items-center space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {"None of your top artists are playing at Glasto 😭"}
                    </p>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </Card>
      {!demoMode && (
        <Drawer
          open={showShareDrawer}
          onClose={() => {
            setShowShareDrawer(false);
          }}
          position="bottom"
          backdrop={false}
          className="bg-wa-background p-2"
          edge={true}
          theme={{ edge: "bottom-16" }}
        >
          <Drawer.Items>
            <div className="mb-2 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400">
              <h3>Share with Whatsapp</h3>
            </div>
            <div className="flex space-x-2">
              <div className="bg-wa-background pv-2 max-h-40 overflow-y-auto">
                <div className="bg-wa-message p-2 rounded">
                  <WhatsappText
                    itineraryInDays={itineraryInDays}
                    selectedEvents={selectedEvents}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  pill
                  color="gray"
                  onClick={() => {
                    window.open(
                      generateWhatsappTextLink(itineraryInDays, selectedEvents)
                    );
                  }}
                >
                  <HiOutlinePaperAirplane className="rotate-90 h-6 w-6" />
                </Button>
              </div>
            </div>
          </Drawer.Items>
        </Drawer>
      )}
    </>
  );
};

export default Itinearry;

const generateWhatsappTextLink = (itineraryInDays, selectedEvents) => {
  let whatsappTextLink = "📀 MyGlastoSetMenu.co.uk\n";
  itineraryInDays.forEach((dailyItinerary: any) => {
    const date = shiftedDay(dailyItinerary[0]?.start);
    const fiteredDailyItinerary = dailyItinerary.filter(
      (e) => selectedEvents[e.id] && selectedEvents[e.id] == "selected"
    );
    if (fiteredDailyItinerary.length) {
      const shortDate = date?.format("dddd");
      whatsappTextLink +=
        emojis[shortDate] + " " + shortDate + " " + emojis[shortDate] + "\n";
      fiteredDailyItinerary.forEach((event: any) => {
        whatsappTextLink += "> `" + event.start.format("h:mma") + "`";
        whatsappTextLink += " " + event.name + " @ ";
        whatsappTextLink += "_" + event.location + "_\n";
      });
    }
  });
  return "https://wa.me/?text=" + encodeURIComponent(whatsappTextLink);
};

const emojis = {
  Wednesday: "🍄",
  Thursday: "🦄",
  Friday: "🎸",
  Saturday: "🎤",
  Sunday: "🎷",
};
