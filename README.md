# Enhanced Forum Project

Remember the forum you built a while ago? Now it’s time to create a better version, incorporating JavaScript, private messaging, real-time interactions, live video sharing, and live screen sharing (well, maybe not the last two). Below is a clear outline of what you will need to do.

---

## Objectives

In this project, your focus will be on the following key points:

- **Registration and Login**
- **Creation of Posts**
- **Commenting on Posts**
- **Private Messages**

You can reuse some parts of your previous forum code but not everything. The new forum will consist of five main components:

1. **SQLite** — to store data (similar to the previous forum)
2. **Golang** — to handle data and WebSocket communication (Backend)
3. **JavaScript** — to manage frontend events and client-side WebSocket interactions
4. **HTML** — to structure the page elements
5. **CSS** — to style the page elements

> **Note:** There will be only one HTML file. Any page changes must be handled dynamically through JavaScript, effectively creating a Single Page Application (SPA).

---

## Registration and Login

Users must register and log in to use the upgraded forum; otherwise, they will only see the registration or login page. The system must implement the following features:

- A registration form requiring the following fields:
  - Nickname
  - Age
  - Gender
  - First Name
  - Last Name
  - E-mail
  - Password

- Login must allow authentication using either **nickname** or **e-mail** combined with the password.
- Users must be able to log out from any page within the forum.

---

## Posts and Comments

This section is similar to your previous forum:

- Users can **create posts**, which must be categorized (similar to before).
- Users can **comment on posts**.
- Posts appear in a feed display.
- Comments are shown only when users click on a specific post.

---

## Private Messages

Users will be able to send private messages to each other. The chat functionality will include:

- **Online/Offline Users Section:**
  - Displays who is available for chat.
  - Ordered by last message sent (like Discord).
  - New users with no messages appear in alphabetical order.
  - Users can send private messages only to online users.
  - This section must always be visible.

- **Chat Section:**
  - Clicking a user reloads past messages.
  - Users can see previous conversations with that user.
  - Initially loads the last 10 messages.
  - On scrolling up, loads 10 more messages without spamming scroll events (use throttling/debouncing techniques).

- **Message Format:**
  - Timestamp showing when the message was sent.
  - Username identifying the sender.

- **Real-Time Messaging:**
  - Messages should appear instantly without page refresh.
  - Implemented via WebSockets on both backend and frontend.

---

## Allowed Packages

- All standard Go packages
- `gorilla/websocket`
- `sqlite3`
- `bcrypt`
- `gofrs/uuid` or `google/uuid`

> **Note:** Usage of frontend frameworks or libraries such as React, Angular, or Vue is **not allowed**.

---

## Learning Outcomes

This project will help you understand and practice:

- **Web fundamentals:**
  - HTML
  - HTTP
  - Sessions and cookies
  - CSS
  - Backend and Frontend interaction
  - DOM manipulation
- **Go language concepts:**
  - Goroutines
  - Channels
- **WebSockets:**
  - Backend WebSocket implementation in Go
  - Frontend WebSocket handling in JavaScript
- **SQL and database management:**
  - Database schema design
  - Querying and manipulating SQLite databases

---
