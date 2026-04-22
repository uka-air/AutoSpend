# AutoSpend (React Native + Expo)

A React Native app (Expo workflow) for iOS and Android that can:

- Import receipt images from gallery
- Take receipt photos with camera
- Run OCR text extraction
- Extract likely `amount`, `merchant`, `date/time`, and `payment method`
- Suggest an expense category automatically

## Run

```bash
npm install
npx expo install
npx expo start -c
```

## Dependency compatibility

This project is aligned to the installed Expo SDK 55 compatibility set:

- `expo-camera@~55.0.16`
- `expo-image-picker@~55.0.19`
- `expo-status-bar@~55.0.5`
- `react@19.2.0`
- `react-native@0.83.6`
- `@types/react@~19.2.10`
- `typescript@~5.9.2`
