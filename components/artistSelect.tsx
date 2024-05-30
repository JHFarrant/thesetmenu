import { useState } from "react";

import { HiCheck, HiOutlinePlusSm } from "react-icons/hi";

import { Button, Badge } from "flowbite-react";

const ArtistSelect = ({
  selectionState,
  toggleSelected,
}: {
  selectionState: any;
  toggleSelected: any;
}) => {
  const [selected, setSelected] = useState(false);

  return (
    <div id="artistSelect">
      <Button
        size="xs"
        color={selectionState == "selected" ? "success" : "blue"}
        onClick={() => toggleSelected()}
      >
        <p className={`text-center`}>
          {selectionState == "selected" ? "Going" : "Select"}
        </p>
      </Button>
      {/*<Badge
                                onClick={()=>setSelected(!selected)}
                                    icon={selected ? HiCheck : HiOutlinePlusSm}
                                    color={selected? "success" : "dark"}
                                  >
                
                                  </Badge>*/}
    </div>
  );
};

export default ArtistSelect;
