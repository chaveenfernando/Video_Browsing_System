package com.sliit.vbs.pattern.strategy;

import com.sliit.vbs.video.entity.Video;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Concrete Strategy: Sorts videos by newest upload date first.
 */
@Component("sortByDateStrategy")
public class SortByDateStrategy implements VideoSortStrategy {

    @Override
    public List<Video> sort(List<Video> videos) {
        List<Video> sorted = new ArrayList<>(videos);
        sorted.sort(Comparator.comparing(Video::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return sorted;
    }

    @Override
    public String getStrategyName() {
        return "date";
    }
}
