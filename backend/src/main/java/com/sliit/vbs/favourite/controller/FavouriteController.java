package com.sliit.vbs.favourite.controller;

import com.sliit.vbs.common.dto.ApiResponse;
import com.sliit.vbs.favourite.dto.FavouriteAnalyticsResponse;
import com.sliit.vbs.favourite.dto.FavouriteRequest;
import com.sliit.vbs.favourite.dto.FavouriteResponse;
import com.sliit.vbs.favourite.service.FavouriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing favourite videos.
 *
 * @author IT25103653
 */
@RestController
@RequestMapping("/api/v1/favourites")
@Tag(name = "Favourites", description = "Favourite Manager - Manage favorite videos")
public class FavouriteController {

    private final FavouriteService favouriteService;

    public FavouriteController(FavouriteService favouriteService) {
        this.favouriteService = favouriteService;
    }

    @PostMapping
    @Operation(summary = "Add a video to favourites (notifies Favourite Manager and Creator)")
    public ResponseEntity<ApiResponse<FavouriteResponse>> addFavourite(
            @Valid @RequestBody FavouriteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        FavouriteResponse response = favouriteService.addFavourite(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Video added to favourites"));
    }

    @DeleteMapping("/video/{videoId}")
    @Operation(summary = "Remove a video from favourites")
    public ResponseEntity<ApiResponse<Void>> removeFavourite(
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        favouriteService.removeFavourite(videoId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Video removed from favourites"));
    }

    @GetMapping
    @Operation(summary = "Get current user's favourite videos")
    public ResponseEntity<ApiResponse<List<FavouriteResponse>>> getFavourites(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(favouriteService.getFavouritesByUser(userDetails.getUsername())));
    }

    @GetMapping("/management")
    @Operation(summary = "Get all platform favourites (Favourite Manager role)")
    public ResponseEntity<ApiResponse<List<FavouriteResponse>>> getAllFavourites() {
        return ResponseEntity.ok(ApiResponse.success(favouriteService.getAllFavourites()));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get favourite analytics, viewer breakdown and rankings (Favourite Manager role)")
    public ResponseEntity<ApiResponse<FavouriteAnalyticsResponse>> getFavouriteAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(favouriteService.getFavouriteAnalytics()));
    }

    @GetMapping("/video/{videoId}/check")
    @Operation(summary = "Check if a video is in user's favourites")
    public ResponseEntity<ApiResponse<Boolean>> checkFavourite(
            @PathVariable Long videoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isFav = favouriteService.isFavourite(videoId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(isFav));
    }
}
