package com.sliit.vbs.comment.service.impl;

import com.sliit.vbs.comment.dto.CommentRequest;
import com.sliit.vbs.comment.dto.CommentResponse;
import com.sliit.vbs.comment.entity.Comment;
import com.sliit.vbs.comment.repository.CommentRepository;
import com.sliit.vbs.comment.service.CommentService;
import com.sliit.vbs.common.exception.BadRequestException;
import com.sliit.vbs.common.exception.ResourceNotFoundException;
import com.sliit.vbs.user.entity.Role;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.user.repository.UserRepository;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of CommentService providing full comment lifecycle management.
 * Comment Managers can view, edit, hide, pin and delete any comment.
 * Regular users can add and delete their own comments only.
 *
 * @author IT25101638
 */
@Service
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    public CommentServiceImpl(CommentRepository commentRepository,
                              UserRepository userRepository,
                              VideoRepository videoRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
    }

    @Override
    public CommentResponse addComment(CommentRequest request, String username) {
        User user = findUser(username);
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + request.getVideoId()));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setUser(user);
        comment.setVideo(video);

        return toResponse(commentRepository.save(comment));
    }

    @Override
    public CommentResponse editComment(Long commentId, String newContent, String username) {
        Comment comment = findComment(commentId);
        User user = findUser(username);

        boolean isOwner = comment.getUser().getId().equals(user.getId());
        boolean isManager = user.getRole() == Role.COMMENT_MANAGER;

        if (!isOwner && !isManager) {
            throw new BadRequestException("You do not have permission to edit this comment");
        }

        comment.setContent(newContent);
        comment.setIsEdited(true);
        return toResponse(commentRepository.save(comment));
    }

    @Override
    public void deleteComment(Long commentId, String username) {
        Comment comment = findComment(commentId);
        User user = findUser(username);

        boolean isOwner = comment.getUser().getId().equals(user.getId());
        boolean isManager = user.getRole() == Role.COMMENT_MANAGER;

        if (!isOwner && !isManager) {
            throw new BadRequestException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Override
    public CommentResponse pinComment(Long commentId) {
        Comment comment = findComment(commentId);
        comment.setIsPinned(true);
        return toResponse(commentRepository.save(comment));
    }

    @Override
    public CommentResponse unpinComment(Long commentId) {
        Comment comment = findComment(commentId);
        comment.setIsPinned(false);
        return toResponse(commentRepository.save(comment));
    }

    @Override
    public CommentResponse hideComment(Long commentId) {
        Comment comment = findComment(commentId);
        comment.setIsHidden(true);
        return toResponse(commentRepository.save(comment));
    }

    @Override
    public CommentResponse unhideComment(Long commentId) {
        Comment comment = findComment(commentId);
        comment.setIsHidden(false);
        return toResponse(commentRepository.save(comment));
    }

    @Override
    public CommentResponse likeComment(Long commentId) {
        commentRepository.incrementLike(commentId);
        return toResponse(findComment(commentId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByVideo(Long videoId) {
        return commentRepository.findVisibleByVideoId(videoId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getAllCommentsByVideo(Long videoId) {
        return commentRepository.findByVideoIdOrderByIsPinnedDescCreatedAtDesc(videoId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getPinnedCommentsByVideo(Long videoId) {
        return commentRepository.findByVideoIdAndIsPinnedTrueOrderByCreatedAtDesc(videoId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByUser(String username) {
        User user = findUser(username);
        return commentRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---- Helpers ----

    private Comment findComment(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private CommentResponse toResponse(Comment c) {
        CommentResponse r = new CommentResponse();
        r.setId(c.getId());
        r.setContent(c.getContent());
        r.setIsPinned(c.getIsPinned());
        r.setIsHidden(c.getIsHidden());
        r.setIsEdited(c.getIsEdited());
        r.setLikeCount(c.getLikeCount());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        if (c.getUser() != null) {
            r.setUserId(c.getUser().getId());
            r.setUserName(c.getUser().getUsername());
        }
        if (c.getVideo() != null) {
            r.setVideoId(c.getVideo().getId());
            r.setVideoTitle(c.getVideo().getTitle());
        }
        return r;
    }
}
