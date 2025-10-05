# Product Requirements Document: Web-Based Video Converter
**Document Name:** POS-PRD.md
**Version:** 3.0
**Date:** October 5, 2025
**Author:** Product Team

## 1. Introduction & Objective

### 1.1 Problem Statement
Creative professionals and business users on diverse operating systems (like Windows and macOS) require a reliable and accessible tool to convert common video formats (MP4, MOV, AVI) into the Windows Media Video (WMV) format. Users often need precise control over encoding parameters like resolution and bitrate to meet specific delivery requirements for file size and quality.

### 1.2 Proposed Solution
We will build a responsive web application that provides a powerful, yet intuitive, interface for converting video files to WMV. Inspired by the robust functionality of professional-grade tools like Adobe Media Encoder, our application will support batch processing, feature a dynamic job queue with real-time thumbnail previews, and offer customizable encoding presets. The application will default to a high-quality "POS Full 2 Mbps" preset, but allow users to fine-tune settings as needed.

### 1.3 Goals
* **Accessibility:** Provide a cross-platform solution that works seamlessly on any modern web browser.
* **Control:** Empower users with detailed encoding settings to manage output quality and file size.
* **Professional UX:** Deliver a user experience that feels robust and reliable, with features like live previews and configurable presets.

## 2. Target Audience
* **Video Professionals & Agencies:** Users who must adhere to strict client specifications for resolution, bitrate, and frame rate.
* **Corporate Teams:** Employees creating video content for internal platforms where file size optimization is critical.
* **Cross-Platform Users:** Individuals on macOS or Linux who need to produce specific, highly-configured Windows-compatible video files.

## 3. Core Features & User Stories

### Epic: End-to-End Web Conversion Workflow

* **User Story 1: Upload Multiple File Types**
    * **As a user, I want to** drag and drop my MP4, MOV, and AVI files onto the web page **so that** they are uploaded and added to the conversion queue.

* **User Story 2: Customize Encoding Settings**
    * **As a user, I want to** access an encoding settings panel, pre-filled with a default preset, **so that** I can adjust parameters like resolution and bitrate to control the final output.

* **User Story 3: See a Live Thumbnail Preview**
    * **As a user, I want to** see a small, updating thumbnail preview of the video that is currently being converted **so that** I can have visual confirmation that the correct file is processing.

* **User Story 4: Manage the Conversion Queue**
    * **As a user, I want to** see all my uploaded files in an organized queue **so that** I can review them, apply settings, and reorder them before starting the conversion.

* **User Story 5: Initiate Batch Conversion**
    * **As a user, I want to** click a single "Start Queue" button **so that** the application begins converting all the videos using their specified settings.

* **User Story 6: Download Converted Files**
    * **As a user, I want to** have a clear "Download" button appear next to each successfully converted file **so that** I can save the finished WMV file to my computer easily.

## 4. Functional Requirements

### 4.1 Platform
* The application will be a web application, accessible through modern desktop browsers (latest versions of Chrome, Firefox, Safari, Edge).

### 4.2 File Handling
* **Input Formats:** `.mp4`, `.mov`, `.avi`.
* **Output Format:** `.wmv`.
* **File Security:** Uploaded files will be automatically deleted from the server 24 hours after upload.

### 4.3 Conversion Queue UI
* The queue will be the central element of the UI. Each row will contain:
    1.  **Thumbnail Preview:** A small video thumbnail.
    2.  **File Name:** The name of the source file.
    3.  **Settings Indicator:** A summary of the applied settings (e.g., "800x600, 2 Mbps CBR"). Clicking this opens the settings panel for that item.
    4.  **Status:** A text indicator (e.g., "Waiting", "Converting 42%", "Completed").
    5.  **Action Button:** A button for "Remove" or "Download".

### 4.4 Encoding Settings Panel
* A settings panel (modal window) can be opened for each individual file or for the entire queue.
* The panel will contain controls for adjusting video settings, populated by a default preset.
* **Default Preset: "POS Full 2 Mbps"**
    * **Resolution:** 800 x 600
    * **Frame Rate:** 30 fps
    * **Field Order:** Progressive
    * **Aspect Ratio:** Square Pixels (1.0)
    * **Bitrate Encoding:** CBR, 2 Pass
    * **Maximum Bitrate:** 2000 kbps (2 Mbps)
* **User-Modifiable Controls in the UI:**
    * **Resolution:** Input fields for `Width` and `Height`.
    * **Frame Rate:** Dropdown menu with common rates (24, 25, 30, 50, 60).
    * **Bitrate Encoding:** Dropdown for `CBR` (Constant Bitrate) and `VBR` (Variable Bitrate).
    * **Maximum Bitrate (kbps):** A slider and input field.
    * **(Optional) Advanced:** Toggles for Keyframe Interval and Buffer Size.
* Users can save their modifications as a new custom preset for future use.

### 4.5 Encoding and Preview Engine
* Conversion will be handled server-side. The user-defined settings for each file will be sent to the encoding engine.
* During encoding, the backend will generate and push preview frames to the frontend for the active thumbnail.

## 5. Non-Functional Requirements
* **Performance:** The web interface must remain responsive. Server-side processing time will vary based on user settings.
* **Scalability:** Backend architecture must handle multiple concurrent user sessions and conversions.
* **Security:** All file transfers must be encrypted (HTTPS).

## 6. UI/UX Flow
1.  **Visit Site & Upload:** User navigates to the URL and uploads video files.
2.  **Queue Population:** Files appear in the queue. Each is assigned the default "POS Full 2 Mbps" preset, and the settings summary is displayed.
3.  **(Optional) Customize Settings:** User clicks the settings summary for one file (or a global "Settings for All" button). A modal opens. The user adjusts the resolution, bitrate, etc., and clicks "Apply". The summary in the queue updates.
4.  **Start Conversion:** User clicks "Start Queue".
5.  **Live Processing:** The first item begins converting using its specified settings. The thumbnail updates in real-time.
6.  **Download:** As each file completes, a "Download" button appears. The next item begins processing. When the queue is finished, a "Download All" button appears.

## 7. Out of Scope for Version 1.0
* **User Accounts:** No user registration, login, or saved history. Custom presets are stored locally in the browser and may be cleared.
* **Audio Settings Configuration:** The audio will be converted using a default high-quality setting (e.g., WMA 10 Pro, 44.1 kHz, Stereo) and will not be user-configurable in the UI.
* **Multiple Output Formats:** The only conversion target is WMV.
* **API Access:** No public API for programmatic conversions will be offered.