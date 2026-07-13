self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow("/index.html"));
});

self.addEventListener("push", function (event) {
  let message = "Novo QR Code processado!";

  if (event.data) {
    try {
      const data = event.data.json();
      message = data.message || message;
    } catch (e) {
      message = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification("Promoção Biscoito Marca X", {
      body: message,
      icon: "assets/image.jpg",
    })
  );
});
