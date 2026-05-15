# Application Walkthrough: Content Broadcasting System

Welcome to the Content Broadcasting System! This guide will walk you through the entire lifecycle of the application, from uploading content as a teacher to approving it as a principal, and finally viewing it live.

## 🎭 Role 1: The Teacher

### 1. Logging In
When you first access the application, you will be presented with the login screen.
- **Email:** `teacher@school.com`
- **Password:** `password`
- Click **Sign In**.

### 2. The Teacher Dashboard
Upon successful login, you are redirected to the Teacher Dashboard (`/teacher`). Here you will see:
- A navigation sidebar with links to **Upload Content** and **My Content**.
- A summary of your content statistics (e.g., how many items are pending, approved, or rejected).

### 3. Uploading Content
To submit a new broadcast:
1. Navigate to **Upload Content** (`/teacher/upload`).
2. **Fill out the form details:**
   - **Title:** e.g., "Math 101 Announcements"
   - **Subject:** e.g., "Mathematics"
   - **Description:** Optional details about the broadcast.
3. **Upload an Image:** Use the drag-and-drop zone to select an image file (JPG, PNG, GIF up to 10MB).
4. **Set the Schedule:** Pick a **Start Time** and **End Time**. *(Note: To test the live broadcast immediately, make sure the current time falls between your start and end time!)*
5. **Set Rotation Duration:** Decide how many seconds this slide should show if multiple broadcasts are active.
6. Click **Submit for Approval**.

### 4. Viewing "My Content"
Navigate to **My Content** (`/teacher/content`) to view a paginated table of all your uploads.
- You will see the image preview, schedule, and the current status (**Pending**, **Approved**, or **Rejected**).
- If an item is rejected, you will be able to see the Principal's rejection reason here.

---

## 🎭 Role 2: The Principal

### 1. Logging In
Log out of the teacher account and return to the login screen.
- **Email:** `principal@school.com`
- **Password:** `password`
- Click **Sign In**.

### 2. The Principal Dashboard
Upon login, you are redirected to the Principal Dashboard (`/principal`).
- The dashboard provides a system-wide overview of all content across all teachers.
- You will see global metrics for Total Content, Pending, Approved, and Rejected items.

### 3. Reviewing Pending Content
1. Navigate to **Pending Approvals** (`/principal/pending`) from the sidebar.
2. You will see a list of all content submitted by teachers that requires your review.
3. For each item, you can review the image, title, and schedule.
4. **Approve:** Click the green **Approve** button to immediately authorize the broadcast.
5. **Reject:** Click the red **Reject** button. A dialog will prompt you to enter a mandatory "Rejection Reason". Once submitted, the teacher will be able to see this feedback.

### 4. Viewing "All Content"
Navigate to **All Content** (`/principal/content`) to see a complete history of every piece of content in the system, regardless of its status.

---

## 📺 The Public Broadcast Page

Once a Teacher has uploaded content AND the Principal has approved it, it is ready to go live!

### Viewing the Live Feed
1. Open a new browser tab and navigate to: `http://localhost:3000/live/t1`
   *(Where `t1` is the system ID for our demo teacher).*
2. **What you will see:**
   - If the current time is **within the scheduled Start and End time**, the uploaded image and description will be displayed on the screen.
   - The page includes a "Live" pulsating indicator.
   - If the current time is outside the scheduled window, or if no content is approved, you will see a fallback "No content available" screen.
3. **Real-time Polling:** This page checks for updates every 5 seconds. If a principal approves an active broadcast while you have this page open, it will automatically appear without you needing to refresh!
