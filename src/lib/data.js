
import { supabase, isConfigured } from './supabase';

function requireSupabase() {
  if (!isConfigured || !supabase) {
    throw new Error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify environment variables.');
  }
}
const columns = 'id,title,description,class_level,subject,stream,chapter,language,pdf_path,is_published,is_paid,created_at';

export async function fetchNotes(filters = {}) {
  requireSupabase();
  let query = supabase.from('notes').select(columns).eq('is_published', true).order('created_at', { ascending: false });
  if (filters.class_level) query = query.eq('class_level', String(filters.class_level));
  if (filters.stream) query = query.eq('stream', filters.stream);
  if (filters.subject) query = query.eq('subject', filters.subject);
  if (filters.language) query = query.eq('language', filters.language);
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,chapter.ilike.%${filters.search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
export async function getPdfUrl(path) {
  requireSupabase();
  const { data, error } = await supabase.storage.from('notes-pdfs').createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}
export async function uploadNote({ file, fields, userId }) {
  requireSupabase();
  if (!userId) throw new Error('Please sign in before uploading.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from('notes-pdfs').upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from('notes').insert({ ...fields, pdf_path: path, is_published: true });
  if (error) {
    await supabase.storage.from('notes-pdfs').remove([path]);
    throw error;
  }
}
export async function updateNote(id, fields) {
  requireSupabase();
  const { error } = await supabase.from('notes').update(fields).eq('id', id);
  if (error) throw error;
}
export async function deleteNote(note) {
  requireSupabase();
  const { error } = await supabase.from('notes').delete().eq('id', note.id);
  if (error) throw error;
  if (note.pdf_path) {
    const { error: storageError } = await supabase.storage.from('notes-pdfs').remove([note.pdf_path]);
    if (storageError) throw storageError;
  }
}
export async function verifyAdmin() {
  requireSupabase();
  const { data, error } = await supabase.rpc('is_edvora_admin');
  if (error) throw error;
  return data === true;
}
