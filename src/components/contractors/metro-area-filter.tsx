"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

import { Button } from "@/src/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/src/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "@/src/components/ui/field";

export type MetroAreaOption = {
  metroArea: string;
  count: number;
};

const MAX_SUGGESTIONS = 12;

export function MetroAreaFilter({
  options,
  selected,
  basePath,
}: {
  options: MetroAreaOption[];
  /** Currently applied filter, straight from the URL. */
  selected: string | null;
  basePath: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(selected ?? "");
  const trimmed = value.trim();

  // Rebuilt only when the metro list changes, not on every keystroke.
  const fuse = useMemo(
    () =>
      new Fuse(options, {
        keys: ["metroArea"],
        ignoreLocation: true,
        threshold: 0.4,
      }),
    [options],
  );

  // Items stay plain strings so the combobox's value type is a string, matching
  // the other comboboxes in the app. Counts come from a lookup at render time.
  const countByMetro = useMemo(
    () => new Map(options.map((option) => [option.metroArea, option.count])),
    [options],
  );

  const suggestions = useMemo(() => {
    if (!trimmed) {
      return options
        .slice(0, MAX_SUGGESTIONS)
        .map((option) => option.metroArea);
    }
    return fuse
      .search(trimmed, { limit: MAX_SUGGESTIONS })
      .map((result) => result.item.metroArea);
  }, [fuse, options, trimmed]);

  function navigate(metroArea: string | null) {
    const target = metroArea
      ? `${basePath}?metro=${encodeURIComponent(metroArea)}`
      : basePath;

    startTransition(() => router.push(target));
  }

  function apply(next: string) {
    setValue(next);

    // Only navigate for a real metro area — typing a partial name shouldn't
    // fire off a query for something that can't match.
    const match = options.find(
      (option) => option.metroArea.toLowerCase() === next.trim().toLowerCase(),
    );

    if (match) navigate(match.metroArea);
  }

  return (
    <Field className="sm:max-w-sm">
      <FieldLabel htmlFor="metro-filter">Filter by metro area</FieldLabel>

      <div className="flex items-center gap-2">
        <Combobox
          items={suggestions}
          // Fuse already ranked these; the built-in filter would undo it.
          filter={null}
          inputValue={value}
          value={trimmed === "" ? null : trimmed}
          onInputValueChange={(next) => setValue(next)}
          onValueChange={(next) => apply(typeof next === "string" ? next : "")}
        >
          <ComboboxInput
            id="metro-filter"
            placeholder="Search metro areas..."
            disabled={isPending}
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>No metro area matches that search.</ComboboxEmpty>
            <ComboboxList>
              {(metroArea: string) => (
                <ComboboxItem key={metroArea} value={metroArea}>
                  <span className="flex-1">{metroArea}</span>
                  <span className="text-xs text-muted-foreground">
                    {countByMetro.get(metroArea)}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {selected && (
          <Button
            variant="ghost"
            onClick={() => {
              setValue("");
              navigate(null);
            }}
            disabled={isPending}
          >
            Clear
          </Button>
        )}
      </div>

      <FieldDescription>
        {selected
          ? `Showing ${selected} only.`
          : "Fuzzy search across metro areas that have contractors."}
      </FieldDescription>
    </Field>
  );
}
