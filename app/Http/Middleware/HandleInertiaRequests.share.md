# Patch: app/Http/Middleware/HandleInertiaRequests.php -> share()

I don't have your HandleInertiaRequests.php, so merge these keys into the array your
`share()` already returns (keep whatever the starter kit put there, e.g. `name`, `quote`, `sidebarOpen`).

```php
'auth' => [
    'user' => $request->user()?->only('id', 'name', 'email'),
    // Drives which sidebar/dashboard variant the layout renders. Decided server-side only.
    'officer' => ($o = $request->user()?->officerProfile) ? [
        'label' => $o->dashboardLabel(),                                   // "BYTE President" / "SSC President"
        'organization' => $o->organization?->name,
        'is_president' => strcasecmp((string) $o->position, 'President') === 0,
        'is_council' => (bool) $o->organization?->is_council,
    ] : null,
],
'flash' => [
    'success' => fn () => $request->session()->get('success'),
    'tracking_code' => fn () => $request->session()->get('tracking_code'),
],
```
