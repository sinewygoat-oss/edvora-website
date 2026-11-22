import { supabase } from './supabase';

const NOTES_TABLE = 'notes';
const STORAGE_BUCKET = 'notes-pdfs';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key to your .env file.');
}

function normalizeNote(row) {
  return {
    ...row,
    class_level: String(row.class_level ?? row.class ?? ''),
    language: row.language ?? row.medium ?? 'English',
    is_paid: Boolean(row.is_paid),
  };
}

export async function fetchNotes(filters = {}) {
  requireClient();
  let { data, error } = await supabase
    .from(NOTES_TABLE)
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    // Some existing EDVORA databases may not yet have an is_published column.
    // RLS must still restrict student access to published rows.
    ({ data, error } = await supabase.from(NOTES_TABLE).select('*').order('created_at', { ascending: false }));
  }
  if (error) throw error;

  const search = (filters.search || '').trim().toLowerCase();
  return (data || []).map(normalizeNote).filter((note) => {
    if (filters.class_level && String(note.class_level) !== String(filters.class_level)) return false;
    if (filters.stream && note.stream && note.stream !== filters.stream) return false;
    if (filters.subject && note.subject !== filters.subject) return false;
    if (filters.language && note.language !== filters.language) return false;
    if (search && ![note.title, note.description, note.subject, note.chapter, note.stream].join(' ').toLowerCase().includes(search)) return false;
    return true;
  });
}

export async function getPdfUrl(path) {
  requireClient();
  if (!path) throw new Error('This note does not have a PDF file attached yet.');
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadNote({ file, fields, userId }) {
  requireClient();
  if (!file || file.type !== 'application/pdf') throw new Error('Please select a PDF file.');
  if (file.size > 20 * 1024 * 1024) throw new Error('PDF must be 20 MB or smaller.');
  if (!userId) throw new Error('Please sign in again before uploading.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;
  const upload = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: 'application/pdf', upsert: false });
  if (upload.error) throw upload.error;
  const row = { ...fields, pdf_path: path, is_published: true };
  const insert = await supabase.from(NOTES_TABLE).insert(row).select().single();
  if (insert.error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    throw insert.error;
  }
  return insert.data;
}

export async function updateNote(id, fields) {
  requireClient();
  const { error } = await supabase.from(NOTES_TABLE).update(fields).eq('id', id);
  if (error) throw error;
}

export async function deleteNote(note) {
  requireClient();
  if (note.pdf_path) {
    const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([note.pdf_path]);
    if (storageError) throw storageError;
  }
  const { error } = await supabase.from(NOTES_TABLE).delete().eq('id', note.id);
  if (error) throw error;
}

export async function verifyAdmin() {
  requireClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return false;
  const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data?.role === 'admin';
}
