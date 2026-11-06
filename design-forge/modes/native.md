# Native mode

An iOS or Android app, combined with one of the other modes. The platform owns the frame. Taste owns the content inside it.

## Stack

Detect it from the repo: `*.xcodeproj` or `Package.swift` (SwiftUI or UIKit), `build.gradle` (Android), `pubspec.yaml` (Flutter), `app.json` with `react-native` (React Native). Say which. Note that `lint.mjs` skips Swift, Dart and Kotlin, and probably misses React Native style objects. `inspect.mjs` cannot open a native app. Native checks rest on screenshots and the critique.

## Frame and content

List the frame in the plan's `Frame` line. The platform keeps it: navigation bar, tab bar, sheets, system alerts, back gesture, safe areas, system controls, text scaling, dark mode. Do not restyle these into a custom bar.

Taste's rules apply to the content inside the frame: type scale and faces, colour roles, spacing, empty and error states, hierarchy of the one question the screen answers (`references/app-screens.md` §2.2, §11).

## Before capture

For each changed screen and state, on each named device:

```
xcrun simctl list devices available
xcrun simctl boot <udid>
xcrun simctl bootstatus <udid> -b
<the repo's own build and install command>
xcrun simctl openurl <udid> <scheme>://<path>
xcrun simctl io <udid> screenshot .plans/<task>/taste/before/<screen>-<device>.png
xcrun simctl shutdown <udid>
```

- Open each screen by deep link. This needs a URL scheme in the app. Without one, that capture is `manual:` with the reason.
- The state (empty, error, loading) must be reachable by a link or a launch argument. If not, that capture is `manual:`.
- Android, only when `adb` is installed: `adb exec-out screencap -p > .plans/<task>/taste/before/<screen>-<device>.png`. No `adb`: the Android captures are `manual:`.
- Never edit the app to make it reachable.

## Critique

Critique the screenshots with taste `references/critique.md`, page rules aside (the app-screen questions in `references/app-screens.md` §2.7 apply). Record `Before: .plans/<task>/taste/before · critique score <n>`.

## Criteria

- Automated where capture works: every changed screen is captured on each named device, and the after score is at or above the before score.
- `manual:` for each step of a flow walk, and for every capture that cannot be automated, with the reason.
- The gate line in the Design section says which of its parts apply. The inspector part does not apply to native.
