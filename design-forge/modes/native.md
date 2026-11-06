# Native mode

An iOS or Android app, combined with one of the other modes. The platform owns the frame. `app.md` rules own the content inside it.

## Stack

Detect it from the repo: `*.xcodeproj` or `Package.swift` (SwiftUI or UIKit), `build.gradle` (Android), `pubspec.yaml` (Flutter), `app.json` with `react-native` (React Native). Say which. Taste's checker cannot open a native app. Native checks rest on simulator screenshots and the `app.md` rubric.

## Frame and content

List the frame in the plan's `Frame` line. The platform keeps it: navigation bar, tab bar, sheets, system alerts, back gesture, safe areas, system controls, text scaling, dark mode. Do not restyle these into a custom bar.

The `app.md` rules apply to the content inside the frame: type scale and faces, colour roles, spacing, empty and error states, the one question the screen answers.

## Before capture

For each changed screen and state, on each named device:

```
xcrun simctl list devices available
xcrun simctl boot <udid>
xcrun simctl bootstatus <udid> -b
<the repo's own build and install command>
xcrun simctl openurl <udid> <scheme>://<path>
xcrun simctl io <udid> screenshot "$PWD/.plans/<task>/taste/before/<screen>-<device>.png"
xcrun simctl shutdown <udid>
```

- `simctl io` needs an absolute path and an existing folder (a relative path fails): run `mkdir -p .plans/<task>/taste/before` first.
- Open each screen by deep link. This needs a URL scheme in the app. Without one, that capture is `manual:` with the reason.
- The state (empty, error, loading) must be reachable by a link or a launch argument. If not, that capture is `manual:`.
- Android, only when `adb` is installed: `adb exec-out screencap -p > .plans/<task>/taste/before/<screen>-<device>.png`. No `adb`: the Android captures are `manual:`.
- Never edit the app to make it reachable.

## Score

Score the screenshots with the `app.md` rubric. Record `Before: .plans/<task>/taste/before · rubric <n>/10`.

## Criteria

- Automated where capture works: every changed screen is captured on each named device, and the after rubric is at or above the before rubric.
- `manual:` for each step of a flow walk, and for every capture that cannot be automated, with the reason.
- No consistency gate on native. The gate line in the Design section says which of its parts apply.
