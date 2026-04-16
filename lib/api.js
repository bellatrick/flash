import { supabase } from './supabase'

// ── Categories ──────────────────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createCategory(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Flashcards ───────────────────────────────────────────

export async function getFlashcards() {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFlashcardsByCategory(categoryId) {
  const allCards = await getFlashcards()
  return allCards.filter(c => c.category_id === categoryId)
}

export async function getFlashcard(id) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*, categories(id, name, slug)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createFlashcard({ prompt, answer, categoryId, audioFile }) {
  let audio_url = null
  let audio_path = null

  if (audioFile) {
    const fileExt = audioFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(fileName, audioFile)
    if (uploadError) throw uploadError
    audio_path = uploadData.path
    const { data: urlData } = supabase.storage.from('audio_files').getPublicUrl(fileName)
    audio_url = urlData.publicUrl
  }

  const { data, error } = await supabase
    .from('flashcards')
    .insert({ prompt, answer, category_id: categoryId || null, audio_url, audio_path })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFlashcard(id, { prompt, answer, categoryId, audioFile, removeAudio, existingAudioPath }) {
  let audio_url = undefined
  let audio_path = undefined

  if (removeAudio && existingAudioPath) {
    await supabase.storage.from('audio_files').remove([existingAudioPath])
    audio_url = null
    audio_path = null
  }

  if (audioFile) {
    if (existingAudioPath) {
      await supabase.storage.from('audio_files').remove([existingAudioPath])
    }
    const fileExt = audioFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(fileName, audioFile)
    if (uploadError) throw uploadError
    audio_path = uploadData.path
    const { data: urlData } = supabase.storage.from('audio_files').getPublicUrl(fileName)
    audio_url = urlData.publicUrl
  }

  const updates = {
    prompt,
    answer,
    category_id: categoryId || null,
    updated_at: new Date().toISOString(),
  }
  if (audio_url !== undefined) updates.audio_url = audio_url
  if (audio_path !== undefined) updates.audio_path = audio_path

  const { data, error } = await supabase
    .from('flashcards')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFlashcard(id, audioPath) {
  if (audioPath) {
    await supabase.storage.from('audio_files').remove([audioPath])
  }
  const { error } = await supabase.from('flashcards').delete().eq('id', id)
  if (error) throw error
}