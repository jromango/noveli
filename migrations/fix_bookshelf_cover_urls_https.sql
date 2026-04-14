-- Normaliza portadas a HTTPS para evitar bloqueo de mixed content
update public.bookshelf
set cover_url = replace(cover_url, 'http://', 'https://')
where cover_url like 'http://%';

-- Opcional: tambien normaliza portadas en titulos seguidos
update public.book_follows
set cover_url = replace(cover_url, 'http://', 'https://')
where cover_url like 'http://%';
