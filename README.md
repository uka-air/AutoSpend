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
npx expo start -c
```

Then launch on iOS/Android simulator or device from the Expo UI.

## Expo Go compatibility note

This project is pinned to **Expo SDK 51** so it works with the current Expo Go release track.

If you see `Project is incompatible with this version of Expo Go`:

1. Update Expo Go from the App Store/Play Store.
2. Clear Metro cache and restart: `npx expo start -c`.
3. If the error persists, reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`.
