import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";

const Context = React.createContext()

export function usePost() {
    return useContext(Context)
}

export function PostProvider({ children }) {
    const { id } = useParams()
    const { loading, error, value: post } = useAsync(() => getPost(id), [id])
    const [comments, setComments] = useState([])

    const commentsByParents = useMemo(() => {
        const group = {}
        comments.forEach(comment => {
            group[comment.parentId] ||= []
            group[comment.parentId].push(comment)

        });
        return group
    }, [comments])

    useEffect(() => {
        if (post?.comments == null) return
        setComments(post.comments)
    }, [post?.comments])


    function getReplies(parentId) {
        return commentsByParents[parentId]
    }

    function createLocalComment(comment) {
        setComments(prevComment => {
            return [comment, ...prevComment]
        })
    }

    function updateLocalComment(id, message) {
        setComments(prevComment => {
            return prevComment.map(comment => {
                if (comment.id === id) {
                    return { ...comment, message }
                } else {
                    return comment
                }
            })
        })
    }

    function deleteLocalComment(id) {
        setComments(prevComment => {
            return prevComment.filter(comment => comment.id !== id)
        })
    }

    function toggleLocalCommentLike(id, addLike) {
        console.log('toggleLocalCommentLike', addLike)
        setComments(prevComment => {
            return prevComment.map(comment => {
                if (comment.id === id) {
                    if (addLike) {
                        return {
                            ...comment,
                            likeCount: comment.likeCount + 1,
                            likedByMe: true,
                        }
                    } else {
                        return {
                            ...comment,
                            likeCount: comment.likeCount - 1,
                            likedByMe: false
                        }
                    }
                } else
                    return comment
            })
        })
    }

    return <Context.Provider
        value={{
            post: { id, ...post },
            rootComments: commentsByParents[null],
            getReplies,
            createLocalComment,
            updateLocalComment,
            deleteLocalComment,
            toggleLocalCommentLike
        }}>
        {loading ? <h1>Loading ...</h1> : error ? <h1 className="error-msg">{error}</h1> : children}
    </Context.Provider>
}