import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/src/lib/prisma";
import {
  ContractorActivityCards,
  ContractorActivityProvider,
  ContractorActivityToggle,
} from "@/src/components/contractors/contractor-activity-toggle";
import type { ContractorSummary } from "@/src/components/contractors/contractor-card";
import {
  MetroAreaFilter,
  type MetroAreaOption,
} from "@/src/components/contractors/metro-area-filter";
import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/src/components/ui/empty";

export const metadata: Metadata = {
  title: "Most Recently Active Contractors",
  description:
    "The 25 building trades contractors most recently active, filterable by metro area.",
};

const LIMIT = 25;
const BASE_PATH = "/contractors/most-recent";

async function getMostRecent(
  metroArea: string | null,
): Promise<ContractorSummary[]> {
  return prisma.contractor.findMany({
    where: metroArea
      ? { metroArea: { equals: metroArea, mode: "insensitive" } }
      : undefined,
    select: {
      id: true,
      cName: true,
      contractorType: true,
      tradeCategory: true,
      metroArea: true,
      city: true,
      about: true,
      services: true,
      mostRecentlyActive: true,
    },
    orderBy: [
      // Newest activity first; nulls last so never-active contractors don't
      // lead a "most recent" list. Ties break alphabetically.
      { mostRecentlyActive: { sort: "desc", nulls: "last" } },
      { cName: "asc" },
    ],
    take: LIMIT,
  });
}

/** Metro areas that actually have contractors, so the filter can't dead-end. */
async function getMetroAreaOptions(): Promise<MetroAreaOption[]> {
  const grouped = await prisma.contractor.groupBy({
    by: ["metroArea"],
    where: { metroArea: { not: null } },
    _count: { _all: true },
    orderBy: { metroArea: "asc" },
  });

  return grouped
    .filter((row) => row.metroArea !== null)
    .map((row) => ({
      metroArea: row.metroArea as string,
      count: row._count._all,
    }));
}

export default async function MostRecentContractorsPage({
  searchParams,
}: PageProps<"/contractors/most-recent">) {
  // Reading searchParams opts this route into request-time rendering, so
  // DATABASE_URL is resolved from the container env rather than at build.
  const params = await searchParams;
  const rawMetro = params.metro;
  const requestedMetro =
    (Array.isArray(rawMetro) ? rawMetro[0] : rawMetro)?.trim() || null;

  const [contractors, metroAreaOptions] = await Promise.all([
    getMostRecent(requestedMetro),
    getMetroAreaOptions(),
  ]);

  const now = new Date();
  // Echo the stored casing rather than whatever the query string held.
  const appliedMetro = requestedMetro
    ? (contractors[0]?.metroArea ??
      metroAreaOptions.find(
        (option) =>
          option.metroArea.toLowerCase() === requestedMetro.toLowerCase(),
      )?.metroArea ??
      requestedMetro)
    : null;

  return (
    <ContractorActivityProvider>
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <header className="mb-6 flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Most Recently Active
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {contractors.length > 0
                  ? `Top ${contractors.length}${
                      appliedMetro ? ` in ${appliedMetro}` : ""
                    }, newest activity first.`
                  : "No contractors match this filter."}
              </p>
            </div>

            <div className="justify-self-center">
              <ContractorActivityToggle />
            </div>

            <div className="md:justify-self-end">
              <Button variant="outline" render={<Link href="/contractors" />}>
                All contractors
              </Button>
            </div>
          </div>

          <MetroAreaFilter
            options={metroAreaOptions}
            selected={appliedMetro}
            basePath={BASE_PATH}
          />
        </header>

        {contractors.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Nothing to show</EmptyTitle>
              <EmptyDescription>
                {appliedMetro
                  ? `No contractors are listed in ${appliedMetro}.`
                  : "No contractors have registered yet."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" render={<Link href={BASE_PATH} />}>
                Clear filter
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ContractorActivityCards contractors={contractors} now={now} />
        )}
      </main>
    </ContractorActivityProvider>
  );
}
