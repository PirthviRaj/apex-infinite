import { TravelSuite } from "@/components/travel/travel-suite";

export default function TravelPage({
  searchParams,
}: {
  searchParams?: { to?: string };
}) {
  return <TravelSuite initialTo={searchParams?.to} />;
}
