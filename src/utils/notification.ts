export async function requestNotificationPermission() {
    // [Browser Notification type definition incorrect · Issue #14701 · Microsoft/TypeScript]
    // (https://github.com/Microsoft/TypeScript/issues/14701)
    type ExtendNotfication = typeof Notification & { permission: NotificationPermission }
    const _Notification = Notification as ExtendNotfication

    if (_Notification.permission !== 'granted') {
        await _Notification.requestPermission()
    }
}
