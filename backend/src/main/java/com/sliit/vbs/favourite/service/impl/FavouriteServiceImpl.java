package com.sliit.vbs.favourite.service.impl;

import com.sliit.vbs.common.exception.BadRequestException;
import com.sliit.vbs.common.exception.ResourceNotFoundException;
import com.sliit.vbs.favourite.dto.FavouriteAnalyticsResponse;
import com.sliit.vbs.favourite.dto.FavouriteRequest;
import com.sliit.vbs.favourite.dto.FavouriteResponse;
import com.sliit.vbs.favourite.entity.Favourite;
import com.sliit.vbs.favourite.repository.FavouriteRepository;
import com.sliit.vbs.favourite.service.FavouriteService;
import com.sliit.vbs.notification.service.NotificationService;
import com.sliit.vbs.user.entity.User;
import com.sliit.vbs.user.repository.UserRepository;
import com.sliit.vbs.video.entity.Video;
import com.sliit.vbs.video.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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
    private final NotificationService notificationService;

    public FavouriteServiceImpl(FavouriteRepository favouriteRepository,
                                UserRepository userRepository,
                                VideoRepository videoRepository,
                                NotificationService notificationService) {
        this.favouriteRepository = favouriteRepository;
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.notificationService = notificationService;
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

        Favourite saved = favouriteRepository.save(favourite);

        // STAKEHOLDER NOTIFICATION:
        // 1. Notify Favourite Manager role
        try {
            notificationService.sendNotification(
                    null,
                    "ROLE_FAVOURITE_MANAGER",
                    user.getUsername(),
                    user.getFullName(),
                    "Viewer Favourited Video",
                    user.getFullName() + " added \"" + video.getTitle() + "\" to favourites.",
                    "FAVOURITE",
                    video.getId()
            );

            // 2. Notify Video Creator if creator is different from viewer
            if (video.getCreator() != null && !video.getCreator().getUsername().equals(user.getUsername())) {
                notificationService.sendNotification(
                        video.getCreator().getUsername(),
                        null,
                        user.getUsername(),
                        user.getFullName(),
                        "Video Saved to Favourites",
                        user.getFullName() + " added your video \"" + video.getTitle() + "\" to favourites.",
                        "FAVOURITE",
                        video.getId()
                );
            }
        } catch (Exception ignored) {
        }

        return toResponse(saved);
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
    public List<FavouriteResponse> getAllFavourites() {
        return favouriteRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FavouriteAnalyticsResponse getFavouriteAnalytics() {
        List<Favourite> all = favouriteRepository.findAllByOrderByCreatedAtDesc();

        FavouriteAnalyticsResponse res = new FavouriteAnalyticsResponse();
        res.setTotalFavourites(all.size());

        Set<Long> uniqueVideos = new HashSet<>();
        Set<Long> uniqueUsers = new HashSet<>();
        Map<Long, List<Favourite>> byVideo = new HashMap<>();

        for (Favourite f : all) {
            uniqueVideos.add(f.getVideo().getId());
            uniqueUsers.add(f.getUser().getId());
            byVideo.computeIfAbsent(f.getVideo().getId(), k -> new ArrayList<>()).add(f);
        }

        res.setTotalVideosFavourited(uniqueVideos.size());
        res.setUniqueUsersCount(uniqueUsers.size());
        res.setRecentFavourites(all.stream().limit(20).map(this::toResponse).collect(Collectors.toList()));

        List<FavouriteAnalyticsResponse.VideoFavouriteSummary> breakdown = new ArrayList<>();
        for (Map.Entry<Long, List<Favourite>> entry : byVideo.entrySet()) {
            List<Favourite> list = entry.getValue();
            if (list.isEmpty()) continue;
            Video v = list.get(0).getVideo();
            FavouriteAnalyticsResponse.VideoFavouriteSummary summary = new FavouriteAnalyticsResponse.VideoFavouriteSummary();
            summary.setVideoId(v.getId());
            summary.setVideoTitle(v.getTitle());
            summary.setThumbnailUrl(v.getThumbnailUrl());
            summary.setCreatorName(v.getCreator() != null ? v.getCreator().getUsername() : "Unknown");
            summary.setCategoryName(v.getCategory() != null ? v.getCategory().getName() : "Uncategorized");
            summary.setLikesCount(v.getLikesCount() != null ? v.getLikesCount() : 0);
            summary.setViewsCount(v.getViewsCount() != null ? v.getViewsCount() : 0);
            summary.setTotalFavourites(list.size());

            List<String> usernames = list.stream()
                    .map(fav -> fav.getUser().getFullName() + " (@" + fav.getUser().getUsername() + ")")
                    .collect(Collectors.toList());
            summary.setFavouritedByUsernames(usernames);

            breakdown.add(summary);
        }

        // Sort descending by number of favourites
        breakdown.sort((a, b) -> Long.compare(b.getTotalFavourites(), a.getTotalFavourites()));
        res.setVideoBreakdown(breakdown);

        return res;
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
        r.setCreatorName(f.getVideo().getCreator() != null ? f.getVideo().getCreator().getUsername() : "Unknown");
        r.setUserId(f.getUser().getId());
        r.setUserName(f.getUser().getFullName() != null ? f.getUser().getFullName() : f.getUser().getUsername());
        r.setUserEmail(f.getUser().getEmail());
        r.setUserRole(f.getUser().getRole() != null ? f.getUser().getRole().name() : "ROLE_GENERAL_VIEWER");
        r.setLikesCount(f.getVideo().getLikesCount() != null ? f.getVideo().getLikesCount() : 0);
        r.setViewsCount(f.getVideo().getViewsCount() != null ? f.getVideo().getViewsCount() : 0);
        r.setCategoryName(f.getVideo().getCategory() != null ? f.getVideo().getCategory().getName() : "General");
        r.setCreatedAt(f.getCreatedAt());
        return r;
    }
}
