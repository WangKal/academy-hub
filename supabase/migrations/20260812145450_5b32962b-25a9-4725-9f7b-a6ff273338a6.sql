create policy "Members can read course media"
on storage.objects for select to authenticated
using (bucket_id = 'course-media');

create policy "Staff can upload course media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'course-media'
  and (public.has_role(auth.uid(),'instructor') or public.has_role(auth.uid(),'admin'))
);

create policy "Staff can update course media"
on storage.objects for update to authenticated
using (
  bucket_id = 'course-media'
  and (public.has_role(auth.uid(),'instructor') or public.has_role(auth.uid(),'admin'))
);

create policy "Staff can delete course media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'course-media'
  and (public.has_role(auth.uid(),'instructor') or public.has_role(auth.uid(),'admin'))
);