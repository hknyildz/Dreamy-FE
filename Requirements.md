## Overview

This document outlines the functional and UI specifications for the **DreamShare** mobile application MVP. The application allows users to log, share, and browse dreams through a social platform. All screens below are part of the MVP scope and must be included in the initial release. The application is mobile-first, designed with simplicity, accessibility, and minimalism in mind.

---

## 1. Authentication Screen

**Purpose**: Allow user to sign in or sign up using email or Google.

### Components:

- Application logo and tagline
- "Sign in with Google" button
- "Sign up / Sign in with Email" form
    - Email field
    - Password field
    - "Forgot password?" link
    - Submit button

### Features:

- Error handling for wrong credentials
- Redirect to Feed upon successful login
- If user has no profile set up (first login), redirect to profile setup page (outside MVP scope)

---

## 2. Feed Screen (Home)

**Purpose**: Display recent entries from followed users, allow users to write new entries.

### Components:

- Tabbar navigation (Feed, Calendar, Search, Profile)
- Scrollable vertical feed
    - Each post includes:
        - Author (username + avatar)
        - Dream excerpt (limited preview)
        - Like count
        - Comment count
        - Tap to navigate to Dream Detail screen
- At the top:
    - Collapsed single-line textbox with placeholder ("Share a dream...")
    - On tap:
        - Expands to full-screen entry creation screen
        - The transition must be animated: the input expands visually into a full post screen (shared element or smooth scale-in effect)
        - Dream creation view includes:
            - Multiline input
            - Date selector (default = today)
            - Submit button

### Features:

- Pull-to-refresh
- Infinite scroll
- Users can input a dream with optional date
- Only followed users’ public entries are shown
- Tapping on a dream opens Dream Detail screen with an **animated expansion** (the dream card enlarges into the detail view)
- **Offline functionality**:
    - Dreams can be written while offline
    - They are stored locally and **automatically uploaded when internet is available**

---

## 3. Calendar Screen

**Purpose**: Show which days have dream entries; allow users to view dreams by date.

### Components:

- Tabbar navigation
- Calendar component with:
    - Visual differentiation for days with and without entries
        - For example: colored dots or filled background on days with dreams
- On selecting a date:
    - List of entries for that date shown below the calendar (if any)
    - If no entry, display placeholder text (“No dream recorded on this day.”)

### Features:

- Tap on calendar date loads associated dreams
- Tap on dream opens Dream Detail screen
- Offline mode: calendar should display locally cached entries
- Users can view their own calendar entries even while offline

---

## 4. Profile Screen (Current User)

**Purpose**: Show and manage user profile and list user’s own entries.

### Components:

- Tabbar navigation
- Top section:
    - Avatar (editable)
    - Username
    - Bio
    - "Edit profile" button
    - Privacy toggle:
        - Users can set their profile to **Public** or **Private**
        - Private profile setting restricts access to dreams for non-friends
- List of own dream entries
    - Ordered by date (latest first)
    - Private dreams visually marked (e.g., lock icon or muted color)
- Each dream:
    - Tap to open Dream Detail screen

### Features:

- Editable avatar, bio, username
- Profile reflects real-time changes
- Dream list scrollable
- Offline support:
    - Users can view all their own past dreams offline
    - Entries are stored locally for access without internet

---

## 5. Profile Screen (Other Users)

**Purpose**: Display another user’s public profile and dreams.

### Components:

- Similar layout to personal profile screen, except:
    - No “Edit” options
    - "Follow" button
    - (Optional) "Send Friend Request" button
    - Calendar icon next to username

### Calendar Icon Feature:

- On tap, show calendar view of that user’s entries
- Tapping a date shows dream(s) from that date

### Other Notes:

- If the viewed profile is set to **Private**:
    - Dreams and calendar content are only visible to accepted friends
    - Non-friends see a message: "This profile is private. Add as a friend to see their dreams."
- Public dreams are listed in reverse chronological order
- Tap on dream opens Dream Detail screen

---

## 6. Search Screen

**Purpose**: Find other users.

### Components:

- Tabbar navigation
- Search bar (input field with placeholder: "Search users...")
- List of matching users below
    - Each user card includes:
        - Avatar
        - Username
        - Short bio (one line)
        - Tap to open user’s profile

### Features:

- Live search or search-on-submit
- No tag or dream search in MVP

---

## 7. Dream Detail Screen

**Purpose**: Show full content of a selected dream with associated interactions.

### Components:

- Top:
    - Author info (username, avatar)
- Dream content (multiline text)
- Metadata:
    - Date and time of entry (bottom of dream text, small font, muted color)
- Comment Section:
    - Scrollable list of comments
        - Each includes username, comment text, timestamp
    - Top of section:
        - Comment input field (placeholder: "Add a comment...")
        - "Send" button

### Features:

- Like functionality (optional in MVP)
- Comments sorted by newest first
- Dream is read-only; no edit/delete in MVP
- Animated transition: the selected dream card from Feed or Profile **expands into** the detail view with a smooth animated transition

---

## Navigation Structure (Tabbar)

1. **Feed**
2. **Search**
3. **Calendar**
4. **Profile**

Each screen must preserve scroll position where relevant, and back navigation should return to the previously viewed state.

---

## Additional Notes

- All entries should support basic markdown (bold, italics, line breaks)
- Dream content input has a max length (e.g., 2000 characters)
- All private entries must be clearly marked and only visible to the entry owner
- MVP excludes media (images, audio), notifications, or advanced search
- **Offline support**:
    - Users can view and search their own dream history offline
    - New dreams can be created offline and will be **automatically synced** when back online
- **Private profiles**:
    - When a profile is set to private, its dream entries and calendar data are only accessible to approved friends