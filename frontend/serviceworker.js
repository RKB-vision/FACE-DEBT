const CACHE_NAME = "facedebt-v1"
const FILES_TO_CACHE = [
    "/frontend/index.html",
    "/frontend/css/style.css",
    "/frontend/js/app.js"
]

self.addEventListener("install", (event) => {
        event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request)
        })
    )
})