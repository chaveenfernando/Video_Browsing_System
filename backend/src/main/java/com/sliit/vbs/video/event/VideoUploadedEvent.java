package com.sliit.vbs.video.event;

import org.springframework.context.ApplicationEvent;

public class VideoUploadedEvent extends ApplicationEvent {

    private final Long videoId;
    private final String videoTitle;
    private final Long uploaderId;
    private final String uploaderName;

    public VideoUploadedEvent(Object source, Long videoId, String videoTitle, Long uploaderId, String uploaderName) {
        super(source);
        this.videoId = videoId;
        this.videoTitle = videoTitle;
        this.uploaderId = uploaderId;
        this.uploaderName = uploaderName;
    }

    public Long getVideoId() {
        return videoId;
    }

    public String getVideoTitle() {
        return videoTitle;
    }

    public Long getUploaderId() {
        return uploaderId;
    }

    public String getUploaderName() {
        return uploaderName;
    }
}
