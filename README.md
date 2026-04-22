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

## Expo Go SDK compatibility

This project is pinned to **Expo SDK 54** to match the current Expo Go app support.

Current compatible package set:

- `expo@~54.0.0`
- `expo-camera@~17.0.10`
- `expo-image-picker@~17.0.10`
- `expo-status-bar@~3.0.9`
- `react@19.1.0`
- `react-native@0.81.0`

If you still see a mismatch warning, run:

```bash
npx expo install --fix
```
