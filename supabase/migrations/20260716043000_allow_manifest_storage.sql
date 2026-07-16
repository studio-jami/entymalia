-- Private deterministic-kit output includes a PWA web manifest.
-- Keep the bucket restrictive while allowing its standards-compliant JSON MIME type.
update storage.buckets
set allowed_mime_types = array['image/*', 'audio/*', 'video/*', 'document/*', 'application/json']
where id = 'etymalia';
