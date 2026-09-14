package com.sliit.vbs.playlist.service.impl;

import com.sliit.vbs.common.exception.BadRequestException;
import com.sliit.vbs.common.exception.ResourceNotFoundException;
import com.sliit.vbs.playlist.dto.PlaylistRequest;
import com.sliit.vbs.playlist.dto.PlaylistResponse;
import com.sliit.vbs.playlist.dto.PlaylistVideoResponse;
import com.sliit.vbs.playlist.entity.Playlist;
import com.sliit.vbs.playlist.entity.PlaylistVideo;
import com.sliit.vbs.playlist.repository.PlaylistRepository;
import com.sliit.vbs.playlist.repository.PlaylistVideoRepository;
import com.sliit.vbs.playlist.service.PlaylistService;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.user.repository.UserRepository;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlaylistServiceImpl implements PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistVideoRepository playlistVideoRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    public PlaylistServiceImpl(PlaylistRepository playlistRepository,
                               PlaylistVideoRepository playlistVideoRepository,
                               UserRepository userRepository,
                               VideoRepository videoRepository) {
        this.playlistRepository = playlistRepository;
        this.playlistVideoRepository = playlistVideoRepository;
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
    }

    @Override
    public PlaylistResponse createPlaylist(PlaylistRequest request, String username) {
        User user = findUser(username);
        Playlist playlist = new Playlist();
        playlist.setTitle(request.getTitle());
        playlist.setDescription(request.getDescription());
        playlist.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        playlist.setUser(user);
        return toResponse(playlistRepository.save(playlist));
    }

    @Override
    @Transactional(readOnly = true)
    public PlaylistResponse getPlaylistById(Long id) {
        return toResponse(findPlaylist(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaylistResponse> getUserPlaylists(String username) {
        User user = findUser(username);
        return playlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaylistResponse> getPublicPlaylists() {
        return playlistRepository.findByIsPublicTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public PlaylistResponse updatePlaylist(Long id, PlaylistRequest request, String username) {
        Playlist playlist = findPlaylistAndVerifyOwner(id, username);
        playlist.setTitle(request.getTitle());
        playlist.setDescription(request.getDescription());
        if (request.getIsPublic() != null) {
            playlist.setIsPublic(request.getIsPublic());
        }
        return toResponse(playlistRepository.save(playlist));
    }

    @Override
    public void deletePlaylist(Long id, String username) {
        Playlist playlist = findPlaylistAndVerifyOwner(id, username);
        playlistVideoRepository.deleteByPlaylistId(id);
        playlistRepository.delete(playlist);
    }

    @Override
    public PlaylistVideoResponse addVideoToPlaylist(Long playlistId, Long videoId, String username) {
        Playlist playlist = findPlaylistAndVerifyOwner(playlistId, username);
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + videoId));

        if (playlistVideoRepository.existsByPlaylistIdAndVideoId(playlistId, videoId)) {
            throw new BadRequestException("Video is already in this playlist");
        }

        int nextOrder = playlistVideoRepository.findMaxDisplayOrderByPlaylistId(playlistId) + 1;
        PlaylistVideo pv = new PlaylistVideo();
        pv.setPlaylist(playlist);
        pv.setVideo(video);
        pv.setDisplayOrder(nextOrder);

        return toVideoResponse(playlistVideoRepository.save(pv));
    }

    @Override
    public void removeVideoFromPlaylist(Long playlistId, Long videoId, String username) {
        findPlaylistAndVerifyOwner(playlistId, username);
        PlaylistVideo pv = playlistVideoRepository.findByPlaylistIdAndVideoId(playlistId, videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found in playlist"));
        playlistVideoRepository.delete(pv);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlaylistVideoResponse> getVideosInPlaylist(Long playlistId) {
        return playlistVideoRepository.findByPlaylistIdOrderByDisplayOrderAsc(playlistId)
                .stream().map(this::toVideoResponse).collect(Collectors.toList());
    }

    // ---- Helpers ----

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private Playlist findPlaylist(Long id) {
        return playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found: " + id));
    }

    private Playlist findPlaylistAndVerifyOwner(Long id, String username) {
        Playlist playlist = findPlaylist(id);
        if (!playlist.getUser().getUsername().equals(username)) {
            throw new BadRequestException("You do not own this playlist");
        }
        return playlist;
    }

    private PlaylistResponse toResponse(Playlist p) {
        PlaylistResponse r = new PlaylistResponse();
        r.setId(p.getId());
        r.setTitle(p.getTitle());
        r.setDescription(p.getDescription());
        r.setIsPublic(p.getIsPublic());
        r.setUserId(p.getUser().getId());
        r.setCreatorName(p.getUser().getUsername());
        r.setCreatedAt(p.getCreatedAt());
        r.setVideoCount((int) playlistVideoRepository.countByPlaylistId(p.getId()));
        return r;
    }

    private PlaylistVideoResponse toVideoResponse(PlaylistVideo pv) {
        PlaylistVideoResponse r = new PlaylistVideoResponse();
        r.setId(pv.getId());
        r.setPlaylistId(pv.getPlaylist().getId());
        r.setVideoId(pv.getVideo().getId());
        r.setVideoTitle(pv.getVideo().getTitle());
        r.setThumbnailUrl(pv.getVideo().getThumbnailUrl());
        r.setCreatorName(pv.getVideo().getCreator().getUsername());
        r.setDisplayOrder(pv.getDisplayOrder());
        r.setAddedAt(pv.getAddedAt());
        return r;
    }
}
