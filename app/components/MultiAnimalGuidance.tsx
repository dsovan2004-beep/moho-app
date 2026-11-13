import React from 'react'

export function MultiAnimalGuidance() {
  return <aside className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" aria-label="Reports involving several animals">
    <p className="font-semibold">Several animals in one report?</p>
    <p className="mt-1">Compare identifying details and current custody for each animal. Say which animal your update refers to. A match or return for one animal does not confirm the others.</p>
    <p className="mt-2">Report status applies to the whole report. Before marking it reunited, confirm that every animal included has returned. If some are still missing, describe that in the latest update and leave the report open.</p>
  </aside>
}
