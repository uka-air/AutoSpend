# AutoSpend (React Native)

React Native app for iOS and Android that can:

- Import receipt images from gallery
- Take receipt photos with camera
- Run OCR text extraction
- Extract likely `amount`, `merchant`, `date/time`, and `payment method`
- Suggest an expense category automatically

## Why this no longer uses Expo Go

To remove the recurring `Project is incompatible with this version of Expo Go` issue, this project now runs as a **standard React Native app (CLI)** instead of Expo Go.

## Run

```bash
npm install
npm run start
npm run ios
# or
npm run android
```

## Native setup notes

- iOS: run `cd ios && pod install` before `npm run ios`.
- Android: ensure camera and media permissions are enabled in your Android manifest.
