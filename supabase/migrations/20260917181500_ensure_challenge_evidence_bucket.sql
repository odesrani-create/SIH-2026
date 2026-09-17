insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'challenge-evidence',
  'challenge-evidence',
  false,
  52428800,
  array['image/*', 'video/*', 'application/pdf', 'text/plain']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload challenge evidence" on storage.objects;
create policy "Anyone can upload challenge evidence"
  on storage.objects for insert
  with check (bucket_id = 'challenge-evidence');
