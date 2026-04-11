import { supabase } from '../lib/supabaseClient'

export interface SocialInteractionSnapshot {
  likesByReview: Record<string, number>
  commentsByReview: Record<string, number>
  likedByCurrentUser: Set<string>
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user.id
}

function isMissingTableError(error: any): boolean {
  const message = String(error?.message || '')
  return message.includes('does not exist') || error?.code === '42P01'
}

export async function getSocialInteractionSnapshot(reviewIds: string[]): Promise<SocialInteractionSnapshot> {
  if (reviewIds.length === 0) {
    return { likesByReview: {}, commentsByReview: {}, likedByCurrentUser: new Set<string>() }
  }

  const userId = await getCurrentUserId()

  const [{ data: reactions, error: reactionsError }, { data: comments, error: commentsError }] = await Promise.all([
    supabase
      .from('review_reactions')
      .select('review_id, user_id')
      .in('review_id', reviewIds),
    supabase
      .from('review_comments')
      .select('review_id')
      .in('review_id', reviewIds),
  ])

  if (reactionsError && !isMissingTableError(reactionsError)) {
    console.error('❌ Error cargando reacciones:', reactionsError)
  }

  if (commentsError && !isMissingTableError(commentsError)) {
    console.error('❌ Error cargando comentarios:', commentsError)
  }

  const likesByReview: Record<string, number> = {}
  const commentsByReview: Record<string, number> = {}
  const likedByCurrentUser = new Set<string>()

  ;(reactions || []).forEach((reaction: any) => {
    likesByReview[reaction.review_id] = (likesByReview[reaction.review_id] || 0) + 1
    if (userId && reaction.user_id === userId) {
      likedByCurrentUser.add(reaction.review_id)
    }
  })

  ;(comments || []).forEach((comment: any) => {
    commentsByReview[comment.review_id] = (commentsByReview[comment.review_id] || 0) + 1
  })

  return { likesByReview, commentsByReview, likedByCurrentUser }
}

export async function toggleReviewLike(reviewId: string): Promise<boolean | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data: existing, error: selectError } = await supabase
    .from('review_reactions')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .maybeSingle()

  if (selectError) {
    if (isMissingTableError(selectError)) return null
    console.error('❌ Error comprobando like:', selectError)
    return null
  }

  if (existing?.id) {
    const { error: deleteError } = await supabase
      .from('review_reactions')
      .delete()
      .eq('id', existing.id)

    if (deleteError) {
      console.error('❌ Error quitando like:', deleteError)
      return null
    }
    return false
  }

  const { error: insertError } = await supabase
    .from('review_reactions')
    .insert([{ review_id: reviewId, user_id: userId }])

  if (insertError) {
    if (isMissingTableError(insertError)) return null
    console.error('❌ Error guardando like:', insertError)
    return null
  }

  return true
}

export async function addReviewComment(reviewId: string, commentText: string): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) return false

  const { error } = await supabase
    .from('review_comments')
    .insert([{ review_id: reviewId, user_id: userId, comment_text: commentText }])

  if (error) {
    if (isMissingTableError(error)) return false
    console.error('❌ Error guardando comentario:', error)
    return false
  }

  return true
}

export function subscribeToSocialInteractions(onChange: () => void): () => void {
  const channel = supabase
    .channel(`social-interactions-${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'review_reactions' }, () => {
      onChange()
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'review_comments' }, () => {
      onChange()
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
