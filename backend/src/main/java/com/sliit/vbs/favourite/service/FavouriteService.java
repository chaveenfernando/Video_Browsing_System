package com.sliit.vbs.favourite.service;

import com.sliit.vbs.favourite.dto.FavouriteAnalyticsResponse;
import com.sliit.vbs.favourite.dto.FavouriteRequest;
import com.sliit.vbs.favourite.dto.FavouriteResponse;

import java.util.List;

/**
 * Service interface for Favourite Manager operations.
 *
 * @author IT25103653
 */
public interface FavouriteService {

    FavouriteResponse addFavourite(FavouriteRequest request, String username);

    void removeFavourite(Long videoId, String username);

    List<FavouriteResponse> getFavouritesByUser(String username);

    List<FavouriteResponse> getAllFavourites();

    FavouriteAnalyticsResponse getFavouriteAnalytics();

    boolean isFavourite(Long videoId, String username);
}
