import { CustomFlowbiteTheme, ToggleSwitch } from "flowbite-react";

const customThemeToggleSwitch: CustomFlowbiteTheme["toggleSwitch"] = {
  toggle: {
    base: "after:rounded-full rounded-full border group-focus:ring-4 group-focus:ring-cyan-500/25",
    checked: {
      on: "after:bg-white after:translate-x-full",
      off: "after:bg-gray-400 dark:after:bg-gray-500 border-gray-200 bg-gray-200 dark:border-gray-600 dark:bg-gray-700"
    }
  }
};

export const RecommendationSwitch = ({
                                       enabled,
                                       recommendationsEnabled,
                                       setRecommendationsEnabled
                                     }: {
  enabled: boolean
  recommendationsEnabled: boolean;
  setRecommendationsEnabled: (value: boolean) => void;
}) => {
  return (
    <div className="min-w-150">
      <ToggleSwitch
        disabled={!enabled}
        color={"success"}
        theme={customThemeToggleSwitch}
        checked={recommendationsEnabled}
        label="Suggest similar artists"
        onChange={() => setRecommendationsEnabled(!recommendationsEnabled)}
      />
    </div>
  );
};

export default RecommendationSwitch;
