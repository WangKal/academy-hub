-- Academy Hub: canonical media storage + learner drill-down support.
-- Execute after the existing authorization migrations.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-media',
  'course-media',
  false,
  524288000,
  array['image/*','video/*','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated users may read media that the application exposes through signed URLs.
drop policy if exists "Members can read course media" on storage.objects;
create policy "Members can read course media"
on storage.objects for select to authenticated
using (bucket_id = 'course-media');

-- Staff uploads remain governed by the canonical permission layer.
drop policy if exists "Canonical staff can upload course media" on storage.objects;
create policy "Canonical staff can upload course media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'course-media'
  and (
    public.is_instructor()
    or public.current_admin_has_permission('courses.create')
    or public.current_admin_has_permission('lesson_content.create')
  )
);

-- Keep object paths user-owned so cleanup and future Python API migration are straightforward.
create index if not exists storage_objects_course_media_name_idx
on storage.objects(bucket_id, name)
where bucket_id = 'course-media';
