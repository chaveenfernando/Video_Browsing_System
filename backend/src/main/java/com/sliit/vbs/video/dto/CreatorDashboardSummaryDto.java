package com.sliit.vbs.video.dto;

import java.util.List;

public class CreatorDashboardSummaryDto {

    private long totalVideos;
    private long totalViews;
    private long totalLikes;
    private double overallEngagementRate;
    private List<VideoResponse> topVideos;

    public CreatorDashboardSummaryDto() {
    }

    public CreatorDashboardSummaryDto(long totalVideos, long totalViews, long totalLikes,
                                     double overallEngagementRate, List<VideoResponse> topVideos) {
        this.totalVideos = totalVideos;
        this.totalViews = totalViews;
        this.totalLikes = totalLikes;
        this.overallEngagementRate = overallEngagementRate;
        this.topVideos = topVideos;
    }

    public long getTotalVideos() {
        return totalVideos;
    }

    public void setTotalVideos(long totalVideos) {
        this.totalVideos = totalVideos;
    }

    public long getTotalViews() {
        return totalViews;
    }

    public void setTotalViews(long totalViews) {
        this.totalViews = totalViews;
    }

    public long getTotalLikes() {
        return totalLikes;
    }

    public void setTotalLikes(long totalLikes) {
        this.totalLikes = totalLikes;
    }

    public double getOverallEngagementRate() {
        return overallEngagementRate;
    }

    public void setOverallEngagementRate(double overallEngagementRate) {
        this.overallEngagementRate = overallEngagementRate;
    }

    public List<VideoResponse> getTopVideos() {
        return topVideos;
    }

    public void setTopVideos(List<VideoResponse> topVideos) {
        this.topVideos = topVideos;
    }
}
