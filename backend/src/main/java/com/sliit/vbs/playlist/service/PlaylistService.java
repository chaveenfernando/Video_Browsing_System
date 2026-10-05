package com.sliit.vbs.playlist.service;

import com.sliit.vbs.playlist.dto.PlaylistRequest;
import com.sliit.vbs.playlist.dto.PlaylistResponse;
import com.sliit.vbs.playlist.dto.PlaylistVideoResponse;

import java.util.List;

public interface PlaylistService {
    PlaylistResponse createPlaylist(PlaylistRequest request, String username);
    PlaylistResponse getPlaylistById(Long id);
    List<PlaylistResponse> getUserPlaylists(String username);
    List<PlaylistResponse> getPublicPlaylists();
    List<PlaylistResponse> getAllPlaylists();
    PlaylistResponse updatePlaylist(Long id, PlaylistRequest request, String username);
    void deletePlaylist(Long id, String username);
    
    PlaylistVideoResponse addVideoToPlaylist(Long playlistId, Long videoId, String username);
    void removeVideoFromPlaylist(Long playlistId, Long videoId, String username);
    List<PlaylistVideoResponse> getVideosInPlaylist(Long playlistId);
}
