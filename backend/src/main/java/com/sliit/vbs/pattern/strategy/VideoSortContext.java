package com.sliit.vbs.pattern.strategy;

import com.sliit.vbs.video.entity.Video;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * VIVA EXPLANATION: Strategy Pattern Context
 * ----------------------------------------------------------------------------
 * VideoSortContext maintains a reference to one of the concrete Strategy objects
 * and delegates the sorting work to it.
 * - In Spring Boot, Spring automatically injects all beans implementing
 *   VideoSortStrategy into the list/map constructor, demonstrating modern IoC.
 * ============================================================================
 */
@Component
public class VideoSortContext {

    private final Map<String, VideoSortStrategy> strategyMap = new HashMap<>();
    private final VideoSortStrategy defaultStrategy;

    public VideoSortContext(List<VideoSortStrategy> strategies, SortByDateStrategy defaultStrategy) {
        this.defaultStrategy = defaultStrategy;
        for (VideoSortStrategy strategy : strategies) {
            strategyMap.put(strategy.getStrategyName().toLowerCase(), strategy);
        }
    }

    public List<Video> executeSort(List<Video> videos, String strategyName) {
        if (strategyName == null || !strategyMap.containsKey(strategyName.toLowerCase())) {
            return defaultStrategy.sort(videos);
        }
        return strategyMap.get(strategyName.toLowerCase()).sort(videos);
    }
}
