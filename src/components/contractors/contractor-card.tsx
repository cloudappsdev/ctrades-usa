import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { formatAbsoluteTime, formatRelativeTime } from "@/src/lib/format-date";

/**
 * Structural type rather than the Prisma model, so this component stays a pure
 * presenter. Prisma's `select` result assigns to it by structural typing.
 */
export type ContractorSummary = {
  id: string;
  cName: string;
  contractorType: "INDIVIDUAL" | "BUSINESS";
  tradeCategory: string;
  metroArea: string | null;
  city: string | null;
  about: string | null;
  services: string | null;
  mostRecentlyActive: Date | null;
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function locationOf({ city, metroArea }: ContractorSummary) {
  return [city, metroArea].filter(Boolean).join(", ") || null;
}

export function ContractorCard({
  contractor,
  now,
  showMostRecentActivity = false,
}: {
  contractor: ContractorSummary;
  /** Passed in so every card in a list measures against the same instant. */
  now: Date;
  showMostRecentActivity?: boolean;
}) {
  const location = locationOf(contractor);
  const { mostRecentlyActive } = contractor;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-balance">{contractor.cName}</CardTitle>
          <Badge
            variant={
              contractor.contractorType === "BUSINESS" ? "default" : "secondary"
            }
          >
            {contractor.contractorType === "BUSINESS"
              ? "Business"
              : "Individual"}
          </Badge>
        </div>

        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-foreground">
            {titleCase(contractor.tradeCategory)}
          </span>
          {location && (
            <>
              <span aria-hidden="true">·</span>
              <span>{location}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {contractor.about && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {contractor.about}
          </p>
        )}

        {contractor.services && (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Services
            </p>
            <p className="line-clamp-2 text-sm">{contractor.services}</p>
          </div>
        )}

        <p className="mt-auto text-xs text-muted-foreground">
          {mostRecentlyActive ? (
            <>
              Active{" "}
              <time
                dateTime={mostRecentlyActive.toISOString()}
                title={formatAbsoluteTime(mostRecentlyActive)}
              >
                {formatRelativeTime(mostRecentlyActive, now)}
              </time>
              {showMostRecentActivity && (
                <>
                  <span aria-hidden="true"> · </span>
                  <time dateTime={mostRecentlyActive.toISOString()}>
                    {formatAbsoluteTime(mostRecentlyActive)}
                  </time>
                </>
              )}
            </>
          ) : (
            "No recorded activity"
          )}
        </p>
      </CardContent>
    </Card>
  );
}
