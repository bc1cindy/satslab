'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { MessageCircle, Reply, Send, User, Clock, Heart, Edit2, Trash2, Check, X } from 'lucide-react'

// Placeholder interfaces since we don't have the actual lib/comments and hooks/useAuth yet
interface Comment {
  id: string
  content: string
  author: string
  avatar?: string
  timestamp: string
  likes: number
  replies: Comment[]
}

// Função para buscar comentários do banco de dados
const fetchComments = async (videoId: string): Promise<Comment[]> => {
  try {
    const response = await fetch(`/api/comments?videoId=${videoId}`)
    if (!response.ok) throw new Error('Erro ao buscar comentários')
    
    const data = await response.json()
    
    // Formatar comentários para o formato esperado
    return (data.comments || []).map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      author: comment.user_name,
      timestamp: comment.created_at,
      likes: comment.likes || 0,
      replies: (comment.replies || []).map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        author: reply.user_name,
        timestamp: reply.created_at,
        likes: reply.likes || 0,
        replies: []
      }))
    }))
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    return []
  }
}

const createComment = async (data: { content: string; videoId: string; parentId?: string; videoTitle?: string }): Promise<Comment> => {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) throw new Error('Erro ao criar comentário')
    
    const comment = await response.json()
    return comment
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    throw error
  }
}

const toggleCommentLike = async (commentId: string): Promise<{ liked: boolean }> => {
  try {
    const response = await fetch('/api/comments/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId })
    })
    
    if (!response.ok) throw new Error('Erro ao processar like')
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao toggle like:', error)
    throw error
  }
}

// Usar sessão do NextAuth
import { useSession } from 'next-auth/react'

const useAuth = () => {
  const { data: session } = useSession()
  return {
    user: session?.user ? { name: session.user.name || 'Usuário', email: session.user.email } : null
  }
}

interface VideoCommentsProps {
  videoId: string
  videoTitle: string
}

export function VideoComments({ videoId, videoTitle }: VideoCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingComments, setLoadingComments] = useState(true)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  // Load comments when component mounts or videoId changes
  useEffect(() => {
    if (videoId) {
      loadComments()
    }
  }, [videoId])

  const loadComments = async () => {
    try {
      setLoadingComments(true)
      const fetchedComments = await fetchComments(videoId)
      setComments(fetchedComments)
    } catch (error) {
      console.warn('Comments not available:', error)
      setComments([]) // Set empty array if comments fail to load
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    
    try {
      const comment = await createComment({
        content: newComment,
        videoId,
        videoTitle
      })

      // Add the new comment to the beginning of the list
      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('Erro ao enviar comentário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setLoading(true)
    
    try {
      const reply = await createComment({
        content: replyText,
        videoId,
        parentId,
        videoTitle
      })

      // Add the reply to the parent comment
      setComments(prev => prev.map(comment => 
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ))
      
      setReplyText('')
      setReplyToId(null)
    } catch (error) {
      console.error('Error creating reply:', error)
      alert('Erro ao enviar resposta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLike = async (commentId: string) => {

    try {
      const result = await toggleCommentLike(commentId)
      
      if (result.liked) {
        setLikedComments(prev => new Set(prev).add(commentId))
      } else {
        setLikedComments(prev => {
          const newSet = new Set(prev)
          newSet.delete(commentId)
          return newSet
        })
      }

      // Update the like count in the UI
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: result.liked ? comment.likes + 1 : Math.max(0, comment.likes - 1)
          }
        }
        // Also check replies
        return {
          ...comment,
          replies: comment.replies.map(reply => 
            reply.id === commentId 
              ? {
                  ...reply,
                  likes: result.liked ? reply.likes + 1 : Math.max(0, reply.likes - 1)
                }
              : reply
          )
        }
      }))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Ontem'
    if (days < 7) return `${days} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText })
      })
      
      if (!response.ok) throw new Error('Erro ao editar comentário')
      
      // Atualizar comentário na lista
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return { ...c, content: editText }
        }
        return {
          ...c,
          replies: c.replies.map(r => 
            r.id === commentId ? { ...r, content: editText } : r
          )
        }
      }))
      
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Erro ao editar comentário:', error)
      alert('Erro ao editar comentário')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return
    
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Erro ao deletar comentário')
      
      if (isReply && parentId) {
        // Remover reply da lista
        setComments(prev => prev.map(c => 
          c.id === parentId
            ? { ...c, replies: c.replies.filter(r => r.id !== commentId) }
            : c
        ))
      } else {
        // Remover comentário principal
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
      alert('Erro ao deletar comentário')
    }
  }

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment, isReply?: boolean, parentId?: string }) => {
    const isLiked = likedComments.has(comment.id)
    const isAuthor = user?.email && comment.author === user.name
    const isEditing = editingId === comment.id
    
    return (
      <div className={`${isReply ? 'ml-8 mt-4' : ''}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            {comment.avatar ? (
              <img src={comment.avatar} alt={comment.author} className="w-8 h-8 rounded-full" />
            ) : (
              <User className="w-4 h-4 text-orange-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-white">{comment.author}</span>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(comment.timestamp)}
              </div>
            </div>
            
            {isEditing ? (
              <div className="mb-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditComment(comment.id)}
                    disabled={loading || !editText.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null)
                      setEditText('')
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-300 mb-3">{comment.content}</p>
            )}
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleToggleLike(comment.id)}
                className={`flex items-center space-x-1 text-xs hover:text-orange-500 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                <span>{comment.likes}</span>
              </button>
              
              {!isReply && (
                <button 
                  onClick={() => setReplyToId(comment.id)}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-orange-500"
                >
                  <Reply className="w-3 h-3" />
                  <span>Responder</span>
                </button>
              )}
              
              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(comment.id)
                      setEditText(comment.content)
                    }}
                    className="flex items-center space-x-1 text-xs text-gray-400 hover:text-blue-500"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
                    className="flex items-center space-x-1 text-xs text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Deletar</span>
                  </button>
                </>
              )}
            </div>
            
            {/* Reply form */}
            {replyToId === comment.id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setReplyToId(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm" 
                        disabled={!replyText.trim() || loading}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
            
            {/* Replies */}
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalComments = comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0)

  return (
    <Card className="bg-gray-900 border-gray-800 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <MessageCircle className="w-5 h-5" />
          <span>Comentários</span>
          <Badge variant="secondary" className="text-xs">
            {totalComments}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* New comment form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deixe seu comentário sobre este vídeo..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!newComment.trim() || loading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Send className="w-3 h-3 mr-1" />
                  {loading ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </div>
          </div>
        </form>
        
        {/* Comments list */}
        <div className="space-y-6">
          {loadingComments ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Carregando comentários...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Seja o primeiro a comentar!</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}