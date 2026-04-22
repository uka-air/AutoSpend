import { useState } from 'react';
import {
  Alert,
  Button,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Asset, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as TextRecognition from 'react-native-text-recognition';
import { parseReceiptText } from './src/ocrParser';
import { ReceiptData } from './src/types';

export default function App() {
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [receiptData, setReceiptData] = useState<ReceiptData | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  async function requestAndroidPermissions() {
    if (Platform.OS !== 'android') {
      return true;
    }

    const camera = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    const photos = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);

    return camera === PermissionsAndroid.RESULTS.GRANTED && photos === PermissionsAndroid.RESULTS.GRANTED;
  }

  async function runOcr(uri: string) {
    try {
      setIsProcessing(true);
      const lines = await TextRecognition.recognize(uri);
      setReceiptData(parseReceiptText(lines));
    } catch {
      Alert.alert('OCR failed', 'Unable to extract text from this image.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleAsset(asset?: Asset) {
    const uri = asset?.uri;
    if (!uri) {
      return;
    }

    setImageUri(uri);
    await runOcr(uri);
  }

  async function importFromGallery() {
    const hasPermissions = await requestAndroidPermissions();
    if (!hasPermissions) {
      Alert.alert('Permission denied', 'Gallery permission is required.');
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1
    });

    if (result.didCancel) {
      return;
    }

    await handleAsset(result.assets?.[0]);
  }

  async function takePhoto() {
    const hasPermissions = await requestAndroidPermissions();
    if (!hasPermissions) {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    const result = await launchCamera({
      mediaType: 'photo',
      saveToPhotos: false
    });

    if (result.didCancel) {
      return;
    }

    await handleAsset(result.assets?.[0]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AutoSpend Receipt Scanner</Text>
        <Text style={styles.subtitle}>React Native iOS + Android · Camera + Gallery + OCR</Text>

        <View style={styles.actions}>
          <Button title="Import from Gallery" onPress={importFromGallery} />
          <Button title="Take Photo" onPress={takePhoto} />
        </View>

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}

        {isProcessing ? <Text style={styles.processing}>Processing OCR...</Text> : null}

        {receiptData ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Extracted Receipt Data</Text>
            <Text>Merchant: {receiptData.merchant ?? 'N/A'}</Text>
            <Text>Amount: {receiptData.amount ?? 'N/A'}</Text>
            <Text>Date/Time: {receiptData.dateTime ?? 'N/A'}</Text>
            <Text>Payment Method: {receiptData.paymentMethod ?? 'N/A'}</Text>
            <Text>Suggested Category: {receiptData.category ?? 'N/A'}</Text>
            <Text style={styles.rawTextTitle}>Raw OCR text:</Text>
            <Text style={styles.rawText}>{receiptData.rawText || 'No text found.'}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7'
  },
  content: {
    padding: 20,
    gap: 16
  },
  title: {
    fontSize: 26,
    fontWeight: '700'
  },
  subtitle: {
    color: '#5b6470'
  },
  actions: {
    gap: 10
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#d6dbe3'
  },
  processing: {
    color: '#1e6ef7',
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  rawTextTitle: {
    marginTop: 8,
    fontWeight: '600'
  },
  rawText: {
    color: '#323844'
  }
});
