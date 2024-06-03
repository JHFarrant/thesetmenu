import { Button, Drawer } from "flowbite-react";
import { HiOutlineChatAlt2, HiOutlinePaperAirplane } from "react-icons/hi";
import WhatsappText from "@/components/whatsappText";
import { Event, SelectedEvents } from "@/types";
import { shiftedDay } from "@/utils/dateUtils";
import { formatDayTitle } from "@/utils/stringUtils";
import { useState } from "react";

const generateWhatsappTextLink = (
  itineraryInDays: Event[][],
  selectedEvents: SelectedEvents
) => {
  let whatsappTextLink = "📀 MyGlastoSetMenu.co.uk\n";
  itineraryInDays.forEach((dailyItinerary: any) => {
    const date = shiftedDay(dailyItinerary[0]?.start);
    const fiteredDailyItinerary = dailyItinerary.filter(
      (e: Event) => selectedEvents[e.id]
    );
    if (fiteredDailyItinerary.length) {
      whatsappTextLink += formatDayTitle(date, true, false) + "\n";
      fiteredDailyItinerary.forEach((event: any) => {
        whatsappTextLink += "> `" + event.start.format("h:mma") + "`";
        whatsappTextLink += " " + event.name + " @ ";
        whatsappTextLink += "_" + event.location + "_\n";
      });
    }
  });
  return "https://wa.me/?text=" + encodeURIComponent(whatsappTextLink);
};


export function ShareDrawer(props: {
  atLeastOneSelected: boolean,
  itineraryInDays: Event[][],
  selectedEvents: SelectedEvents,
}) {
  console.log(props.selectedEvents);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [drawerOpenedAtLeastOnce, setDrawerOpenedAtLeastOnce] = useState(false);

  if (props.atLeastOneSelected && !drawerOpenedAtLeastOnce) {
    setDrawerOpenedAtLeastOnce(true);
    setShowShareDrawer(true);
  }
  if (!props.atLeastOneSelected && showShareDrawer) {
    setShowShareDrawer(false);
    setDrawerOpenedAtLeastOnce(false);
  }

  return <Drawer
    open={showShareDrawer}
    onClose={() => setShowShareDrawer(false)}
    position="bottom"
    backdrop={false}
    className="bg-wa-background dark:bg-wa-background-dark p-2"
    edge={false}
  >
    <Drawer.Items>
      <div className="mb-2 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400">
        <HiOutlineChatAlt2 className="mr-2" />
        <h3> Share with Whatsapp</h3>
      </div>
      <div className="flex space-x-2">
        <div className="bg-wa-background dark:bg-wa-background-dark pv-2 max-h-40 overflow-y-auto">
          <div className="bg-wa-message-bg dark:bg-wa-message-bg-dark p-2 rounded">
            <WhatsappText
              itineraryInDays={props.itineraryInDays}
              selectedEvents={props.selectedEvents}
            />
          </div>
        </div>
        <div className="flex items-end">
          {showShareDrawer && (
            <Button
              pill
              color="light"
              onClick={() => {
                window.open(
                  generateWhatsappTextLink(
                    props.itineraryInDays,
                    props.selectedEvents
                  )
                );
              }}
            >
              <HiOutlinePaperAirplane className="rotate-90 h-6 w-6" />
            </Button>
          )}
        </div>
      </div>
    </Drawer.Items>
  </Drawer>;
}

