package com.sliit.vbs.favourite.service.impl;

import com.sliit.vbs.common.exception.BadRequestException;
import com.sliit.vbs.common.exception.ResourceNotFoundException;
import com.sliit.vbs.favourite.dto.FavouriteRequest;
import com.sliit.vbs.favourite.dto.FavouriteResponse;
import com.sliit.vbs.favourite.entity.Favourite;
import com.sliit.vbs.favourite.repository.FavouriteRepository;
import com.sliit.vbs.favourite.service.FavouriteService;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.user.repository.UserRepository;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of FavouriteService.
 *
 * @author IT25103653
 */
@Service
@Transactional
public class FavouriteServiceImpl implements FavouriteService {

    private final FavouriteRepository favouriteRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    public FavouriteServiceImpl(FavouriteRepository favouriteRepository,
                                UserRepository userRepository,
                                VideoRepository videoRepository) {
        this.favouriteRepository = favouriteRepository;
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
    }

    @Override
    public FavouriteResponse addFavourite(FavouriteRequest request, String username) {
        User user = findUser(username);
        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + request.getVideoId()));

        if (favouriteRepository.existsByUserIdAndVideoId(user.getId(), video.getId())) {
            throw new BadRequestException("Video is already in favourites");
        }

        Favourite favourite = new Favourite();
        favourite.setUser(user);
        favourite.setVideo(video);

        return toResponse(favouriteRepository.save(favourite));
    }

    @Override
    public void removeFavourite(Long videoId, String username) {
        User user = findUser(username);
        favouriteRepository.deleteByUserIdAndVideoId(user.getId(), videoId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FavouriteResponse> getFavouritesByUser(String username) {
        User user = findUser(username);
        return favouriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavourite(Long videoId, String username) {
        User user = findUser(username);
        return favouriteRepository.existsByUserIdAndVideoId(user.getId(), videoId);
    }

    // ---- Helpers ----

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private FavouriteResponse toResponse(Favourite f) {
        FavouriteResponse r = new FavouriteResponse();
        r.setId(f.getId());
        r.setVideoId(f.getVideo().getId());
        r.setVideoTitle(f.getVideo().getTitle());
        r.setThumbnailUrl(f.getVideo().getThumbnailUrl());
        r.setCreatorName(f.getVideo().getCreator().getUsername());
        r.setCreatedAt(f.getCreatedAt());
        return r;
    }
}
