import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { prisma } from "@/src/lib/prisma";
import type { ContractorSummary } from "@/src/components/contractors/contractor-card";
import {
  ContractorActivityCards,
  ContractorActivityProvider,
  ContractorActivityToggle,
} from "@/src/components/contractors/contractor-activity-toggle";
import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/src/components/ui/empty";

export const metadata: Metadata = {
  title: "Contractors by Recent Activity",
  description: "Building trades contractors, most recently active first.",
};

const PAGE_SIZE = 60;

async function getContractorsByActivity(): Promise<ContractorSummary[]> {
  return prisma.contractor.findMany({
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
      // Contractors that have never been active sort last, not first, which is
      // what Postgres would otherwise do for DESC.
      { mostRecentlyActive: { sort: "desc", nulls: "last" } },
      { cName: "asc" },
    ],
    take: PAGE_SIZE,
  });
}

export default async function ContractorsPage() {
  // Opts this route into request-time rendering. Required for the Docker
  // rollout: DATABASE_URL is then read from the container environment at
  // runtime rather than needing to exist during `next build`, so one image
  // can be promoted across environments.
  await connection();

  const contractors = await getContractorsByActivity();
  const now = new Date();

  return (
    <ContractorActivityProvider>
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <header className="mb-6 flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Contractors
              </h1>
              <p className="text-sm text-muted-foreground">
                {contractors.length > 0
                  ? `${contractors.length} listed, most recently active first.`
                  : "Building trades, most recently active first."}
              </p>
            </div>

            <div className="justify-self-center">
              <ContractorActivityToggle />
            </div>

            <Button render={<Link href="/contractors/register" />}>
              Register as a contractor
            </Button>
          </div>
        </header>

        {contractors.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No contractors yet</EmptyTitle>
              <EmptyDescription>
                Once trades register, they&apos;ll appear here ordered by how
                recently they were active.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link href="/contractors/register" />}>
                Add the first contractor
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ContractorActivityCards contractors={contractors} now={now} />
        )}

        {contractors.length === PAGE_SIZE && (
          <p className="mt-6 text-sm text-muted-foreground">
            Showing the {PAGE_SIZE} most recently active contractors.
          </p>
        )}
      </main>
    </ContractorActivityProvider>
  );
}
