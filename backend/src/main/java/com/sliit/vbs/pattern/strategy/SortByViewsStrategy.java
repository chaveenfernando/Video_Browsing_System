package com.sliit.vbs.pattern.strategy;

import com.sliit.vbs.video.entity.Video;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Concrete Strategy: Sorts videos by highest view count first (Most Popular).
 */
@Component("sortByViewsStrategy")
public class SortByViewsStrategy implements VideoSortStrategy {

    @Override
    public List<Video> sort(List<Video> videos) {
        List<Video> sorted = new ArrayList<>(videos);
        sorted.sort(Comparator.comparing(Video::getViewsCount, Comparator.nullsLast(Comparator.reverseOrder())));
        return sorted;
    }

    @Override
    public String getStrategyName() {
        return "views";
    }
}
