package com.sliit.vbs.pattern.strategy;

import com.sliit.vbs.video.entity.Video;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Concrete Strategy: Sorts videos alphabetically by title (A - Z).
 */
@Component("sortByTitleStrategy")
public class SortByTitleStrategy implements VideoSortStrategy {

    @Override
    public List<Video> sort(List<Video> videos) {
        List<Video> sorted = new ArrayList<>(videos);
        sorted.sort(Comparator.comparing(Video::getTitle, String.CASE_INSENSITIVE_ORDER));
        return sorted;
    }

    @Override
    public String getStrategyName() {
        return "title";
    }
}
