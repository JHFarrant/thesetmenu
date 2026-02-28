import { Button } from "flowbite-react";

type SelectButtonProps = {
  selectionState: string;
  toggleSelected: () => void;
};

const ArtistSelectButton = ({
                              selectionState,
                              toggleSelected
                            }: SelectButtonProps) => {
  return (
    <div id="artistSelect">
      <Button
        size="xs"
        color={selectionState === "selected" ? "success" : "blue"}
        onClick={toggleSelected}
      >
        <p className={`text-center`}>
          {selectionState === "selected" ? "Going" : "Select"}
        </p>
      </Button>
    </div>
  );
};

export default ArtistSelectButton;
