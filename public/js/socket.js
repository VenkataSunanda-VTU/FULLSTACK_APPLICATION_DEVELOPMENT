// ================================
// socket.js
// Handles all WebSocket communications
// ================================

let socket;

// Initialize socket connection
export function initSocket() {
  socket = io(); // Connect to server
  console.log("WebSocket initialized");

  // Listen for connection confirmation
  socket.on("connect", () => {
    console.log("Connected to server via WebSocket:", socket.id);
  });

  // Real-time event updates
  socket.on("eventCreated", (event) => {
    console.log("New event created:", event);
    document.dispatchEvent(new CustomEvent("eventCreated", { detail: event }));
  });

  socket.on("eventUpdated", (event) => {
    console.log("Event updated:", event);
    document.dispatchEvent(new CustomEvent("eventUpdated", { detail: event }));
  });

  socket.on("eventDeleted", ({ id }) => {
    console.log("Event deleted:", id);
    document.dispatchEvent(new CustomEvent("eventDeleted", { detail: id }));
  });

  // Real-time notifications
  socket.on("newNotification", (notification) => {
    console.log("New notification received:", notification);
    document.dispatchEvent(new CustomEvent("newNotification", { detail: notification }));
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });
}

// ---------------------------
// Emit functions
// ---------------------------
export function emitEventCreated(event) {
  if (socket) socket.emit("eventCreated", event);
}

export function emitEventUpdated(event) {
  if (socket) socket.emit("eventUpdated", event);
}

export function emitEventDeleted(eventId) {
  if (socket) socket.emit("eventDeleted", { id: eventId });
}

export function emitNotification(notification) {
  if (socket) socket.emit("newNotification", notification);
}

// ---------------------------
// Utility: Listen to custom events in dashboard.js
// ---------------------------
export function onEvent(eventName, callback) {
  document.addEventListener(eventName, (e) => {
    callback(e.detail);
  });
}