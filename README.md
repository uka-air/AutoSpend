# AutoSpend (React Native + Expo)

A React Native app (Expo workflow) for iOS and Android that can:

- Import receipt images from gallery
- Take receipt photos with camera
- Run OCR text extraction
- Extract likely `amount`, `merchant`, `date/time`, and `payment method`
- Suggest an expense category automatically

## Run

```bash
rm -rf node_modules node_modules/.package-lock.json package-lock.json
npm install
npx expo install --fix
npx expo start -c
```

## Dependency compatibility (Expo SDK 55)

This project is aligned to Expo SDK 55-compatible versions:

- `expo@~55.0.17`
- `expo-camera@~55.0.16`
- `expo-image-picker@~55.0.19`
- `expo-status-bar@~55.0.5`
- `react@19.2.0`
- `react-native@0.83.6`
- `@types/react@~19.2.10`
- `typescript@~5.9.2`

If you still see `ERESOLVE`, make sure your local `node_modules` was fully removed before reinstalling.
