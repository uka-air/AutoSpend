# AutoSpend (React Native)

A React Native (Expo) starter for iOS and Android that can:

- Import receipt images from gallery
- Take receipt photos with camera
- Run OCR text extraction
- Extract likely `amount`, `merchant`, `date/time`, and `payment method`
- Suggest an expense category automatically

## Run

```bash
npm install
npm run start
```

Then launch on iOS/Android simulator or device from the Expo UI.


## Troubleshooting: "Project is incompatible with this version of Expo Go"

This project is currently on **Expo SDK 52** (`expo` `~52.0.0` in `package.json`).
If your phone has an older Expo Go build, Expo will block launch with that compatibility error.

### Fix on a physical device

1. Update **Expo Go** from the iOS App Store / Google Play Store.
2. Fully close Expo Go and reopen it after updating.
3. Restart the dev server with a clean cache:

```bash
npx expo start -c
```

4. Re-scan the QR code from the new dev server session.

### If you still cannot update Expo Go

- Use an emulator/simulator with a current Expo Go version, or
- Build a development client (`npx expo run:ios` / `npx expo run:android`) so you are not blocked by Expo Go store version lag.
