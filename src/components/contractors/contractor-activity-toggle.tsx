"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  ContractorCard,
  type ContractorSummary,
} from "@/src/components/contractors/contractor-card";

type ContractorActivityContextValue = {
  showMostRecentActivity: boolean;
  setShowMostRecentActivity: Dispatch<SetStateAction<boolean>>;
};

const ContractorActivityContext =
  createContext<ContractorActivityContextValue | null>(null);

export function ContractorActivityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [showMostRecentActivity, setShowMostRecentActivity] = useState(false);

  return (
    <ContractorActivityContext.Provider
      value={{ showMostRecentActivity, setShowMostRecentActivity }}
    >
      {children}
    </ContractorActivityContext.Provider>
  );
}

export function ContractorActivityToggle() {
  const activity = useContext(ContractorActivityContext);

  if (!activity) {
    throw new Error(
      "ContractorActivityToggle must be used within ContractorActivityProvider",
    );
  }

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-full border-2 border-black px-4 py-2 text-sm font-medium">
      <span>Toggle / Show Most Recent Activity Date</span>
      <input
        type="checkbox"
        checked={activity.showMostRecentActivity}
        onChange={(event) =>
          activity.setShowMostRecentActivity(event.target.checked)
        }
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 rounded-full bg-muted transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-ring/30 peer-checked:bg-primary after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-background after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

export function ContractorActivityCards({
  contractors,
  now,
}: {
  contractors: ContractorSummary[];
  now: Date;
}) {
  const activity = useContext(ContractorActivityContext);

  if (!activity) {
    throw new Error(
      "ContractorActivityCards must be used within ContractorActivityProvider",
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {contractors.map((contractor) => (
        <li key={contractor.id}>
          <ContractorCard
            contractor={contractor}
            now={now}
            showMostRecentActivity={activity.showMostRecentActivity}
          />
        </li>
      ))}
    </ul>
  );
}
