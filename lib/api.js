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

// ── Sub-categories ───────────────────────────────────────

export async function getSubCategories(categoryId) {
  const { data, error } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('category_id', categoryId)
    .order('name')
  if (error) throw error
  return data
}

export async function getAllSubCategories() {
  const { data, error } = await supabase
    .from('sub_categories')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createSubCategory(categoryId, name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const { data, error } = await supabase
    .from('sub_categories')
    .insert({ category_id: categoryId, name, slug })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSubCategory(id) {
  const { error } = await supabase.from('sub_categories').delete().eq('id', id)
  if (error) throw error
}

// ── Flashcards ───────────────────────────────────────────

export async function getFlashcards() {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*, categories(id, name, slug), sub_categories(id, name, slug)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFlashcardsByCategory(categoryId) {
  const allCards = await getFlashcards()
  return allCards.filter(c => c.category_id === categoryId)
}

export async function getFlashcardsBySubCategory(subcategoryId) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*, categories(id, name, slug), sub_categories(id, name, slug)')
    .eq('subcategory_id', subcategoryId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getFlashcard(id) {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*, categories(id, name, slug), sub_categories(id, name, slug)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createFlashcard({ prompt, answer, categoryId, subcategoryId, audioFile }) {
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
    .insert({
      prompt,
      answer,
      category_id: categoryId || null,
      subcategory_id: subcategoryId || null,
      audio_url,
      audio_path,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function bulkCreateFlashcards(flashcards) {
  const { data, error } = await supabase
    .from('flashcards')
    .insert(flashcards)
    .select()
  if (error) throw error
  return data
}

export async function updateFlashcard(id, { prompt, answer, categoryId, subcategoryId, audioFile, removeAudio, existingAudioPath }) {
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
    subcategory_id: subcategoryId || null,
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

// ── Bulk Operations ──────────────────────────────────────

/**
 * Move ALL cards from a source (category + optional sub-category)
 * to a destination (category + optional sub-category).
 */
export async function moveAllFlashcards({ fromCategoryId, fromSubcategoryId, toCategoryId, toSubcategoryId }) {
  let query = supabase.from('flashcards').update({
    category_id: toCategoryId || null,
    subcategory_id: toSubcategoryId || null,
  })

  if (fromSubcategoryId) {
    query = query.eq('subcategory_id', fromSubcategoryId)
  } else {
    query = query.eq('category_id', fromCategoryId).is('subcategory_id', null)
  }

  const { error } = await query
  if (error) throw error
}

/**
 * Move a specific set of cards (by ID) to a new category/sub-category.
 */
export async function moveSelectedFlashcards({ cardIds, toCategoryId, toSubcategoryId }) {
  const { error } = await supabase
    .from('flashcards')
    .update({
      category_id: toCategoryId || null,
      subcategory_id: toSubcategoryId || null,
    })
    .in('id', cardIds)
  if (error) throw error
}

/**
 * Delete ALL cards in a category (optionally scoped to a sub-category).
 * Pass subcategoryId to delete only that sub-cat's cards.
 * Pass only categoryId (no subcategoryId) to delete cards with no sub-cat in that category.
 * Pass { categoryId, subcategoryId: '__all__' } to delete everything in the category.
 */
export async function deleteAllFlashcardsInCategory({ categoryId, subcategoryId }) {
  let query = supabase.from('flashcards')

  if (subcategoryId === '__all__') {
    // Delete every card in the category regardless of sub-cat
    query = query.delete().eq('category_id', categoryId)
  } else if (subcategoryId) {
    query = query.delete().eq('subcategory_id', subcategoryId)
  } else {
    // Only cards at the root (no sub-category)
    query = query.delete().eq('category_id', categoryId).is('subcategory_id', null)
  }

  const { error } = await query
  if (error) throw error
}

/**
 * Delete a specific set of cards by ID.
 */
export async function deleteSelectedFlashcards(cardIds) {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .in('id', cardIds)
  if (error) throw error
}

/**
 * Converts a top-level category into a sub-category of a target category.
 * Creates a new sub-category, shifts all cards in the source category
 * to the target category with the new sub-category reference,
 * then deletes the original source category.
 */
export async function convertCategoryToSubcategory(sourceCategoryId, targetCategoryId) {
  // 1. Fetch details of the source category
  const { data: sourceCat, error: sourceError } = await supabase
    .from('categories')
    .select('name')
    .eq('id', sourceCategoryId)
    .single()
  if (sourceError) throw sourceError

  // 2. Create new sub-category under target category
  const slug = sourceCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const { data: newSub, error: subError } = await supabase
    .from('sub_categories')
    .insert({ category_id: targetCategoryId, name: sourceCat.name, slug })
    .select()
    .single()
  if (subError) throw subError

  // 3. Move all cards from the source category to target category and new sub-category
  const { error: moveError } = await supabase
    .from('flashcards')
    .update({
      category_id: targetCategoryId,
      subcategory_id: newSub.id
    })
    .eq('category_id', sourceCategoryId)
  if (moveError) throw moveError

  // 4. Delete the original source category (this will cascade delete any old empty sub_categories)
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', sourceCategoryId)
  if (deleteError) throw deleteError
}

/**
 * Deletes a category and all flashcards associated with it.
 */
export async function deleteCategory(id) {
  // 1. Delete all flashcards in this category
  const { error: cardsError } = await supabase
    .from('flashcards')
    .delete()
    .eq('category_id', id)
  if (cardsError) throw cardsError

  // 2. Delete the category itself
  const { error: catError } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  if (catError) throw catError
}