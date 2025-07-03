const CACHE_NAME = 'pelajari-v1.0.0'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/vite.svg',
  // Add other static assets
]

const API_CACHE_NAME = 'pelajari-api-v1'
const LEARNING_CONTENT_CACHE = 'pelajari-content-v1'

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle static assets
  event.respondWith(handleStaticAssets(request))
})

// Handle API requests with cache-first strategy for learning content
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const isLearningContent = url.pathname.includes('/learning/modules') && request.method === 'GET'
  
  if (isLearningContent) {
    try {
      const cachedResponse = await caches.match(request, { cacheName: LEARNING_CONTENT_CACHE })
      if (cachedResponse) {
        // Return cached content and update in background
        updateCache(request)
        return cachedResponse
      }
    } catch (error) {
      console.warn('Cache lookup failed:', error)
    }
  }

  try {
    const response = await fetch(request)
    
    if (response.ok && isLearningContent) {
      // Cache learning content for offline access
      const cache = await caches.open(LEARNING_CONTENT_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Return cached version if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    
    throw error
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request)
    return response
  } catch (error) {
    // Return cached page or offline page
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return caches.match('/offline.html')
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    throw error
  }
}

// Background cache update
async function updateCache(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(LEARNING_CONTENT_CACHE)
      cache.put(request, response.clone())
    }
  } catch (error) {
    console.warn('Background cache update failed:', error)
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync offline data when connection is restored
    const syncData = await getOfflineData()
    if (syncData.length > 0) {
      await syncOfflineData(syncData)
      await clearOfflineData()
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Get offline data from IndexedDB
async function getOfflineData() {
  // Implementation would use IndexedDB to retrieve offline data
  return []
}

// Sync offline data to server
async function syncOfflineData(data) {
  // Implementation would sync data to server
}

// Clear offline data after successful sync
async function clearOfflineData() {
  // Implementation would clear synced data from IndexedDB
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Pelajari',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'pelajari-notification',
    data: event.data ? JSON.parse(event.data.text()) : {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/open-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Pelajari', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
}) 