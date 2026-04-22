# AutoSpend (React Native + Expo)

A React Native app (Expo workflow) for iOS and Android that can:

- Import receipt images from gallery
- Take receipt photos with camera
- Run OCR text extraction
- Extract likely `amount`, `merchant`, `date/time`, and `payment method`
- Suggest an expense category automatically

## Clean install (recommended)

```bash
npm run clean
npm install
npx expo install --fix
npx expo start -c
```

## Dependency compatibility (Expo SDK 55)

This project is locked to Expo SDK 55-compatible versions in both `dependencies` and `overrides`.

- `expo@~55.0.17`
- `expo-camera@~55.0.16`
- `expo-image-picker@~55.0.19`
- `expo-status-bar@~55.0.5`
- `react@19.2.0`
- `react-native@0.83.6`
- `@types/react@~19.2.10`
- `typescript@~5.9.2`

If npm still reports older versions (`expo@54`, `react-native@0.74`, `@types/react@18`), your local `node_modules` tree is stale—run `npm run clean` and reinstall.
