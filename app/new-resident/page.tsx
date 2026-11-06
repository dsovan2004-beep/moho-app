import Link from "next/link";
import { RESIDENT_CITIES } from "@/lib/new-resident";
import ResidentCityVisual from "@/app/components/ResidentCityVisual";
export const metadata = {
  title: "New Resident Guides | MoHoLocal",
  description:
    "Move-in checklists and official utility and school resources for Mountain House, Tracy, Lathrop and Manteca.",
};
export default function NewResidentPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="rounded-3xl bg-[#f1eee5] p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
          A little local knowledge goes a long way
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#18324f] sm:text-5xl">
          New home.
          <br />
          Your next steps, sorted.
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-slate-700">
          Choose your city for official setup links, school enrollment resources
          and a useful move-in checklist. Then find local help and ways to meet
          your community.
        </p>
      </header>
      <section aria-labelledby="choose-city" className="mt-9">
        <h2 id="choose-city" className="mb-5 text-2xl font-bold text-[#18324f]">
          Where are you settling in?
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {RESIDENT_CITIES.map((city) => (
            <article
              key={city.slug}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
            >
              <ResidentCityVisual city={city.name} />
              <div className="p-6">
                <p className="text-sm text-slate-600">{city.county}</p>
                <h3 className="mt-1 text-2xl font-bold text-[#18324f]">
                  {city.name}
                </h3>
                <p className="mt-3 text-slate-600">
                  Utilities · School enrollment · Move-in checklist · Local
                  connections
                </p>
                <Link
                  href={`/new-resident/${city.slug}`}
                  className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#19352d] px-5 py-3 font-semibold text-white"
                >
                  Open {city.name} guide →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <p className="mt-7 text-sm leading-relaxed text-slate-600">
        Photos show their labeled location and capture date. Mountain House
        currently uses a labeled 2026 satellite view; a street photo is still
        being researched.{" "}
        <Link href="/photo-credits" className="underline">
          Photo credits and reuse details
        </Link>
        .
      </p>
    </div>
  );
}
