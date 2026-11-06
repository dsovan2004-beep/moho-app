"use client";
import { useState } from "react";
const TASKS = [
  {
    phase: "Before moving",
    title: "Arrange utilities",
    detail:
      "Confirm water, waste, electricity and gas providers for your exact address; schedule service with the official providers.",
  },
  {
    phase: "Before moving",
    title: "Confirm school enrollment",
    detail:
      "Use the official district finder and enrollment instructions. Ask about boundaries, documents and placement.",
  },
  {
    phase: "First week",
    title: "Check collection and internet availability",
    detail:
      "Confirm bin collection days, move-in arrangements and internet service availability directly with providers.",
  },
  {
    phase: "First week",
    title: "Find everyday help",
    detail:
      "Shortlist cleaners, landscapers and repair providers. Compare scope, availability, insurance and written quotes.",
  },
  {
    phase: "First week",
    title: "Plan care and pet contacts",
    detail:
      "Check healthcare and veterinary providers directly for location, hours, eligibility and appointments.",
  },
  {
    phase: "First month",
    title: "Get to know your community",
    detail:
      "Explore current events, cultural classes and neighborhood discussions. Confirm dates and registration with organizers.",
  },
];
export default function MoveInChecklist({ city }: { city: string }) {
  const [done, setDone] = useState<number[]>([]);
  return (
    <section
      id="checklist"
      className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8"
    >
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Your next steps
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#18324f]">
            Settle into {city}
          </h2>
        </div>
        <p role="status" className="text-sm text-slate-600">
          {done.length} of {TASKS.length} complete
        </p>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Tick off what you have done. Progress stays on this page while it is
        open; it is not saved to your account.
      </p>
      <div className="mt-5 divide-y divide-slate-200">
        {TASKS.map((task, i) => (
          <label key={task.title} className="flex cursor-pointer gap-4 py-4">
            <input
              type="checkbox"
              checked={done.includes(i)}
              onChange={(e) =>
                setDone((previous) =>
                  e.target.checked
                    ? [...previous, i]
                    : previous.filter((n) => n !== i),
                )
              }
              className="mt-1 h-6 w-6 shrink-0 accent-emerald-800"
            />
            <span>
              <span className="block text-xs font-bold uppercase tracking-wide text-emerald-800">
                {task.phase}
              </span>
              <span
                className={`mt-1 block font-bold ${done.includes(i) ? "text-slate-500 line-through" : "text-slate-900"}`}
              >
                {task.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                {task.detail}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
