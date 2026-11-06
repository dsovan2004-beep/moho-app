import Link from "next/link";
import { notFound } from "next/navigation";
import {
  RESIDENT_CITIES,
  RESIDENT_RESOURCES,
  RESIDENT_CHECKED,
  residentLinks,
} from "@/lib/new-resident";
import MoveInChecklist from "@/app/components/MoveInChecklist";
import ResidentCityVisual from "@/app/components/ResidentCityVisual";
export const runtime = "nodejs";
type Props = { params: Promise<{ city: string }> };
export async function generateMetadata({ params }: Props) {
  const { city: slug } = await params;
  const city = RESIDENT_CITIES.find((c) => c.slug === slug);
  return city
    ? {
        title: `Moving to ${city.name} | MoHoLocal`,
        description: `Official setup resources and a move-in checklist for ${city.name}.`,
      }
    : {};
}
export default async function ResidentGuide({ params }: Props) {
  const { city: slug } = await params;
  const city = RESIDENT_CITIES.find((c) => c.slug === slug);
  if (!city) notFound();
  const resources = RESIDENT_RESOURCES[slug];
  const links = residentLinks(city.name);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav
        aria-label="Resident guide cities"
        className="mb-6 flex flex-wrap gap-2"
      >
        {RESIDENT_CITIES.map((c) => (
          <Link
            key={c.slug}
            aria-current={c.slug === slug ? "page" : undefined}
            href={`/new-resident/${c.slug}`}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold ${c.slug === slug ? "bg-[#18324f] text-white" : "bg-white text-slate-700"}`}
          >
            {c.name}
          </Link>
        ))}
      </nav>
      <header className="grid overflow-hidden rounded-3xl border border-slate-200 bg-[#f1eee5] md:grid-cols-2">
        <div className="p-6 sm:p-9">
          <Link
            href="/new-resident"
            className="inline-flex min-h-11 items-center text-sm underline"
          >
            All move-in guides
          </Link>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-800">
            Make yourself at home
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#18324f] sm:text-4xl">
            Welcome to {city.name}.
          </h1>
          <p className="mt-4 leading-relaxed text-slate-700">
            Start with the essentials, find everyday help and discover your
            community at your own pace.
          </p>
          <a
            href="#checklist"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#19352d] px-5 py-3 font-semibold text-white"
          >
            Start your move-in checklist ↓
          </a>
        </div>
        <ResidentCityVisual city={city.name} />
      </header>
      <p className="my-5 text-sm text-slate-600">
        Official resource information checked {RESIDENT_CHECKED}. Confirm
        service coverage and school placement directly for your address.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          {
            id: "utilities",
            title: "1. Set up essential services",
            items: resources.utilities,
          },
          {
            id: "schools",
            title: "2. Find your school district",
            items: resources.schools,
          },
        ].map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"
          >
            <h2 className="text-2xl font-bold text-[#18324f]">
              {section.title}
            </h2>
            <div className="mt-4 divide-y divide-slate-200">
              {section.items.map((item) => (
                <div key={item.title} className="py-4">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.detail}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center font-semibold text-emerald-800 underline"
                  >
                    Official resource: {item.title} ↗
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-7">
        <MoveInChecklist key={slug} city={city.name} />
      </div>
      <section className="mt-8 rounded-3xl bg-[#19352d] p-6 text-white sm:p-8">
        <h2 className="text-2xl font-bold">Put down roots in {city.name}</h2>
        <p className="mt-3 max-w-2xl leading-relaxed">
          Find local services, explore events and cultural classes, or connect
          with neighbors. Check provider evidence and confirm availability
          before making arrangements.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            { label: "Find local help", href: links.directory },
            { label: "Events", href: links.events },
            { label: "Cultural classes", href: links.classes },
            { label: "Community", href: links.community },
            { label: "Lost & found pets", href: links.pets },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-3 font-semibold text-[#19352d]"
            >
              {item.label} →
            </Link>
          ))}
        </div>
      </section>
      <p className="mt-6 text-sm leading-relaxed text-slate-600">
        Something changed?{" "}
        <a
          className="inline-flex min-h-11 items-center underline"
          href={`mailto:dsovan2004@gmail.com?subject=${encodeURIComponent(`Correction: ${city.name} resident guide`)}`}
        >
          Report a guide correction
        </a>
        .{" "}
        <Link href="/photo-credits" className="underline">
          Photo sources and credits
        </Link>
        .
      </p>
    </div>
  );
}
