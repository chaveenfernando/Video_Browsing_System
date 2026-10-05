package com.sliit.vbs.comment.service;

import com.sliit.vbs.comment.dto.CommentRequest;
import com.sliit.vbs.comment.dto.CommentResponse;

import java.util.List;

/**
 * Service interface for comment management operations.
 *
 * @author IT25101638
 */
public interface CommentService {

    CommentResponse addComment(CommentRequest request, String username);

    CommentResponse editComment(Long commentId, String newContent, String username);

    void deleteComment(Long commentId, String username);

    CommentResponse pinComment(Long commentId);

    CommentResponse unpinComment(Long commentId);

    CommentResponse hideComment(Long commentId);

    CommentResponse unhideComment(Long commentId);

    CommentResponse likeComment(Long commentId);

    List<CommentResponse> getCommentsByVideo(Long videoId);

    List<CommentResponse> getAllCommentsByVideo(Long videoId);

    List<CommentResponse> getPinnedCommentsByVideo(Long videoId);

    List<CommentResponse> getCommentsByUser(String username);
    List<CommentResponse> getAllComments();
}
