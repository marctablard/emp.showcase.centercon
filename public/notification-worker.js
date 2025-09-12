// This is the service worker for handling push notifications

// Listen for push events
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    // Parse the incoming data
    const payload = event.data.json();

    // Extract notification details
    const title = payload.title || 'New Notification';
    console.log('Received push notification payload:', payload);

    const options = {
      tag: payload.id,
      body: payload.body || '',
      icon: payload.icon || '/images/logo_small.svg',
      badge: payload.badge || '/images/logo.svg',
      data: {
        url: payload.url || '/',
        id: payload.id,
        ...payload.data,
      },
      requireInteraction: true,
      // Add vibration pattern for mobile devices
      vibrate: [100, 50, 100, 50, 100, 50, 100],
      // Show notification timestamp
      timestamp: payload.timestamp || Date.now(),
      actions: payload.actions || [],
    };

    // Display the notification
    event.waitUntil(
      Promise.all([
        self.registration.showNotification(title, options),
        // Notify all clients about the new notification
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'NEW_NOTIFICATION',
              payload: payload,
            });
          });
        }),
      ]),
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Check if an action button was clicked
  let urlToOpen = '/';

  if (event.action) {
    console.log('Action clicked:', event.action);

    // Find the matching action in the notification data
    const clickedAction = event.notification.data?.actions?.find((action) => action.action === event.action);

    if (clickedAction && clickedAction.url) {
      urlToOpen = clickedAction.url;
    } else {
      // Handle specific actions
      switch (event.action) {
        case 'go-to-cart':
          urlToOpen = '/cart';
          break;
        // Add more action handlers as needed
        default:
          // Use the default URL from notification data
          urlToOpen = event.notification.data?.url || '/';
      }
    }
  } else {
    // Default notification click (not an action button)
    urlToOpen = event.notification.data?.url || '/';
  }

  // Mark notification as read via API
  const notificationId = event.notification.data?.id;
  if (notificationId) {
    fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read: true }),
    }).catch((error) => console.error('Error marking notification as read:', error));
  }

  // Open the URL in the existing window/tab if possible
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window/tab is open with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});

// Service worker installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
