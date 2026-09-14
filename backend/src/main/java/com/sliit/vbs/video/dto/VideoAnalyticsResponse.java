package com.sliit.vbs.video.dto;

public class VideoAnalyticsResponse {

    private Long videoId;
    private String title;
    private Long views;
    private Long likes;
    private double engagementRate;
    private String status;

    public VideoAnalyticsResponse() {
    }

    public VideoAnalyticsResponse(Long videoId, String title, Long views, Long likes, double engagementRate, String status) {
        this.videoId = videoId;
        this.title = title;
        this.views = views;
        this.likes = likes;
        this.engagementRate = engagementRate;
        this.status = status;
    }

    public Long getVideoId() {
        return videoId;
    }

    public void setVideoId(Long videoId) {
        this.videoId = videoId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getViews() {
        return views;
    }

    public void setViews(Long views) {
        this.views = views;
    }

    public Long getLikes() {
        return likes;
    }

    public void setLikes(Long likes) {
        this.likes = likes;
    }

    public double getEngagementRate() {
        return engagementRate;
    }

    public void setEngagementRate(double engagementRate) {
        this.engagementRate = engagementRate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
