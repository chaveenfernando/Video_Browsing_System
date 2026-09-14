# Web-Based Video Browsing System (VBS)

> **University**: SLIIT  
> **Course**: SE2030 - Software Engineering  
> **Group ID**: `2026-Y2-S1-MLB-B5G2-03`  
> **Current Module**: **Content Creator** (Branch: `Content-Creator`, Author: `chaveenfernando`)

---

## 📌 Project Overview

The **Web-Based Video Browsing System (VBS)** is an enterprise full-stack web application designed for interactive video sharing, browsing, and community engagement. The system is split into **6 specialized domain roles** (one per team member) sharing a unified database schema, security layer, and design patterns:

| # | Domain Role | Assigned Team Responsibility | Status on this Branch |
|---|---|---|---|
| **1** | **Content Creator** *(Current)* | Upload, edit, delete videos, thumbnail/duration, video stream URLs, tags, channel analytics, engagement rates | **Fully Implemented & Verified** |
| 2 | Category Manager | Create, rename, merge, delete categories and topics | Foundation & Entity Ready |
| 3 | Playlist Manager | Create playlists, add/remove videos, reorder sequence | Foundation & Entity Ready |
| 4 | Favourite Manager | Bookmark favorite videos, view collection, clear all | Foundation & Entity Ready |
| 5 | Comment Manager | Video comment feed, reply, pin, hide, and moderation | Foundation & Entity Ready |
| 6 | Technical Supporter | Submit support tickets, status tracking (Open/Resolved), bug reports | Foundation & Entity Ready |
| **-** | **Shared Platform** | JWT authentication (Register/Login), public browsing, search, dynamic sorting, and video player | **Fully Implemented & Verified** |

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.3 (Spring Web, Spring Data JPA, Spring Security, Validation)
- **Authentication**: Stateless JWT (`io.jsonwebtoken:jjwt 0.12.6`) + BCrypt hashing
- **Database**: MySQL with **Flyway** migration versioning (`V1__init.sql`, `V2__seed_data.sql`)
- **Testing & Tooling**: JUnit 5, Mockito, SpringDoc OpenAPI (Swagger UI)

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom dark studio theme)
- **Icons**: Lucide React
- **Routing & Networking**: React Router DOM v6, Axios with Bearer token interceptor

---

## 📐 Design Patterns (Viva Defense Reference)

The project implements and executes three standard Gang of Four (GoF) design patterns:

### 1. Strategy Pattern (`com.sliit.vbs.pattern.strategy`)
- **Where**: `VideoSortStrategy`, `SortByDateStrategy`, `SortByViewsStrategy`, `SortByTitleStrategy`, and `VideoSortContext`.
- **Used In**: `VideoServiceImpl.getAllVideos(...)` for sorting the public and studio catalog.
- **Viva Defense**: *“Instead of hardcoding messy `if/else` checks to determine whether to sort by date, views, or alphabetical title, we encapsulate each sorting algorithm into its own strategy class implementing `VideoSortStrategy`. This adheres to the Open/Closed Principle (OCP)—we can add a new trending score strategy in the future without modifying existing service code.”*

### 2. Factory Pattern (`com.sliit.vbs.pattern.factory`)
- **Where**: `NotificationFactory`, `Notification`, `EmailNotification`, `InAppNotification`.
- **Used In**: `VideoServiceImpl.createVideo(...)` when a video is published.
- **Viva Defense**: *“The Factory Method decouples business logic from concrete product instantiation. The client calls `notificationFactory.createNotification('EMAIL')` or `'IN_APP'` without needing to know concrete class constructors or dependencies, making notification channel extensions seamless.”*

### 3. Observer Pattern (`com.sliit.vbs.pattern.observer`)
- **Where**: `TicketStatusObserver`, `TicketSubject`, `EmailTicketObserver`, `InAppTicketObserver`.
- **Used In**: Support ticket workflow to automatically broadcast status transitions (e.g. `OPEN` to `RESOLVED`) to all registered observer listeners.
- **Viva Defense**: *“Implements a one-to-many dependency between state-changing objects and dependent notification handlers without coupling the core ticket entity to external messaging protocols.”*

---

## 🚀 Getting Started & Setup Guide

### 1. Prerequisites
- **Java 21** installed (`java -version`)
- **Node.js 18+** & npm installed (`node -v`)
- **MySQL 8+** (Optional: H2 in-memory mode is supported out of the box)

---

### 2. Backend Setup
```bash
cd backend

# Build and run with MySQL (Dev profile)
./mvnw.cmd spring-boot:run

# OR run with in-memory H2 profile (zero MySQL setup required)
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```
- Server starts at: `http://localhost:8080`
- Live Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console (when in local profile): `http://localhost:8080/h2-console`

---

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 🔑 Demo Accounts for Viva Presentation

All accounts come pre-configured in `V2__seed_data.sql`:
- **Default Password for all users**: `password123`

| Role | Email / Username | Notes |
|---|---|---|
| **Content Creator** | `creator@sliit.lk` / `creator_user` | Has full access to Creator Studio, video upload, edit, delete, and analytics |
| Category Manager | `category@sliit.lk` / `category_user` | Category management |
| Playlist Manager | `playlist@sliit.lk` / `playlist_user` | Playlist organization |
| Favourite Manager | `favourite@sliit.lk` / `favourite_user` | Bookmarks and favorites |
| Comment Manager | `comment@sliit.lk` / `comment_user` | Comment moderation |
| Technical Supporter | `support@sliit.lk` / `support_user` | Support ticketing and bug logs |

---

## 👥 Branching & Contribution Instructions for Teammates

1. **Each teammate works on their designated branch**:
   - `Category-Manager`
   - `Playlist-Manager`
   - `Favorite-Manager`
   - `Comment-Manager`
   - `Technical-Supporter`
2. Teammates must fetch from origin and pull the latest base structure from `origin/Content-Creator` or `main`:
   ```bash
   git checkout <your-branch>
   git pull origin Content-Creator
   ```
3. Implement your feature package under `backend/src/main/java/com/sliit/vbs/<your-feature>/` and `frontend/src/features/<your-feature>/`.
4. Submit a Pull Request into `main` after completing unit tests.