-- Events are an editorial public feed. Held/pending records must not be readable through the Data API.
-- Existing UI queries already require approved; enforce the same boundary in Postgres.
alter policy "Public read events" on public.events using (status = 'approved');
