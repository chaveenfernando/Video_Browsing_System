package com.sliit.vbs.favourite.dto;

import java.util.List;

public class FavouriteAnalyticsResponse {

    private long totalFavourites;
    private long totalVideosFavourited;
    private long uniqueUsersCount;
    private List<FavouriteResponse> recentFavourites;
    private List<VideoFavouriteSummary> videoBreakdown;

    public FavouriteAnalyticsResponse() {
    }

    public long getTotalFavourites() {
        return totalFavourites;
    }

    public void setTotalFavourites(long totalFavourites) {
        this.totalFavourites = totalFavourites;
    }

    public long getTotalVideosFavourited() {
        return totalVideosFavourited;
    }

    public void setTotalVideosFavourited(long totalVideosFavourited) {
        this.totalVideosFavourited = totalVideosFavourited;
    }

    public long getUniqueUsersCount() {
        return uniqueUsersCount;
    }

    public void setUniqueUsersCount(long uniqueUsersCount) {
        this.uniqueUsersCount = uniqueUsersCount;
    }

    public List<FavouriteResponse> getRecentFavourites() {
        return recentFavourites;
    }

    public void setRecentFavourites(List<FavouriteResponse> recentFavourites) {
        this.recentFavourites = recentFavourites;
    }

    public List<VideoFavouriteSummary> getVideoBreakdown() {
        return videoBreakdown;
    }

    public void setVideoBreakdown(List<VideoFavouriteSummary> videoBreakdown) {
        this.videoBreakdown = videoBreakdown;
    }

    public static class VideoFavouriteSummary {
        private Long videoId;
        private String videoTitle;
        private String creatorName;
        private String categoryName;
        private String thumbnailUrl;
        private long likesCount;
        private long viewsCount;
        private long totalFavourites;
        private List<String> favouritedByUsernames;

        public VideoFavouriteSummary() {
        }

        public Long getVideoId() {
            return videoId;
        }

        public void setVideoId(Long videoId) {
            this.videoId = videoId;
        }

        public String getVideoTitle() {
            return videoTitle;
        }

        public void setVideoTitle(String videoTitle) {
            this.videoTitle = videoTitle;
        }

        public String getCreatorName() {
            return creatorName;
        }

        public void setCreatorName(String creatorName) {
            this.creatorName = creatorName;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public String getThumbnailUrl() {
            return thumbnailUrl;
        }

        public void setThumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
        }

        public long getLikesCount() {
            return likesCount;
        }

        public void setLikesCount(long likesCount) {
            this.likesCount = likesCount;
        }

        public long getViewsCount() {
            return viewsCount;
        }

        public void setViewsCount(long viewsCount) {
            this.viewsCount = viewsCount;
        }

        public long getTotalFavourites() {
            return totalFavourites;
        }

        public void setTotalFavourites(long totalFavourites) {
            this.totalFavourites = totalFavourites;
        }

        public List<String> getFavouritedByUsernames() {
            return favouritedByUsernames;
        }

        public void setFavouritedByUsernames(List<String> favouritedByUsernames) {
            this.favouritedByUsernames = favouritedByUsernames;
        }
    }
}
