package com.sliit.vbs.auth.service;

import com.sliit.vbs.auth.dto.AuthResponse;
import com.sliit.vbs.auth.dto.LoginRequest;
import com.sliit.vbs.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
