package com.sliit.vbs.pattern.strategy;

import com.sliit.vbs.video.entity.Video;
import java.util.List;

/**
 * ============================================================================
 * DESIGN PATTERN: STRATEGY PATTERN (Behavioral)
 * ----------------------------------------------------------------------------
 * WHERE IS IT USED:
 * - In com.sliit.vbs.video.service.impl.VideoServiceImpl when users or content
 *   creators browse and search video catalogs.
 *
 * WHY IS IT USED:
 * - Problem: Different sorting algorithms (by upload date, by total views,
 *   by alphabetical title) need to be applied interchangeably at runtime without
 *   violating the Open/Closed Principle (OCP).
 * - Solution: Strategy defines a family of algorithms, encapsulates each one
 *   in a separate class, and makes them interchangeable without modifying the client.
 * ============================================================================
 */
public interface VideoSortStrategy {

    /**
     * Applies sorting algorithm to the list of videos.
     *
     * @param videos The mutable or copy list of videos to sort
     * @return Sorted list of videos
     */
    List<Video> sort(List<Video> videos);

    /**
     * Identifies the strategy key (e.g., "date", "views", "title").
     */
    String getStrategyName();
}
