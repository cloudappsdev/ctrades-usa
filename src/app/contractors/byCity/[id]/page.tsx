import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/src/lib/prisma";
import {
  ContractorCard,
  type ContractorSummary,
} from "@/src/components/contractors/contractor-card";
import { Button } from "@/src/components/ui/button";

/**
 * The `[id]` segment carries a metro area name, not a record id. Values are
 * user-entered ("Greater Phoenix"), so the segment arrives percent-encoded.
 */
function decodeMetroArea(id: string) {
  try {
    return decodeURIComponent(id).trim();
  } catch {
    // Malformed percent-encoding (e.g. a stray "%") throws rather than 500ing.
    return "";
  }
}

async function getContractorsInMetroArea(
  metroArea: string,
): Promise<ContractorSummary[]> {
  return prisma.contractor.findMany({
    where: {
      // Case-insensitive so /contractor/greater%20phoenix resolves the same as
      // /contractor/Greater%20Phoenix.
      metroArea: { equals: metroArea, mode: "insensitive" },
    },
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
      // Newest activity first. Nulls last, otherwise Postgres puts contractors
      // that were never active at the top of a "most recent" list.
      { mostRecentlyActive: { sort: "desc", nulls: "last" } },
      { cName: "asc" },
    ],
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/contractors/byCity/[id]">): Promise<Metadata> {
  const metroArea = decodeMetroArea((await params).id);

  return {
    title: metroArea
      ? `Contractors in ${metroArea}`
      : "Contractors by Metro Area",
    description: `Building trades contractors serving ${metroArea}, most recently active first.`,
  };
}

export default async function ContractorsByMetroAreaPage({
  params,
}: PageProps<"/contractors/byCity/[id]">) {
  const metroArea = decodeMetroArea((await params).id);

  if (!metroArea) notFound();

  const contractors = await getContractorsInMetroArea(metroArea);

  // A metro area only exists insofar as a contractor references it, so no
  // matches means the URL names nothing.
  if (contractors.length === 0) notFound();

  const now = new Date();
  // Prefer the stored casing over whatever the URL supplied.
  const displayName = contractors[0].metroArea ?? metroArea;

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Metro area</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {contractors.length}{" "}
            {contractors.length === 1 ? "contractor" : "contractors"}, most
            recently active first.
          </p>
        </div>

        <Button variant="outline" render={<Link href="/contractors" />}>
          All contractors
        </Button>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contractors.map((contractor) => (
          <li key={contractor.id}>
            <ContractorCard contractor={contractor} now={now} />
          </li>
        ))}
      </ul>
    </main>
  );
}
