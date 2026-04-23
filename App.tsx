import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Button, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from 'react-native-text-recognition';
import { parseReceiptText } from './src/ocrParser';
import { ReceiptData } from './src/types';

export default function App() {
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [receiptData, setReceiptData] = useState<ReceiptData | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrData, setQrData] = useState<string | undefined>();

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



  async function decodeQrFromImage(uri: string) {
    try {
      // Use runtime require to avoid Expo camera type-package mismatch during TypeScript checks.
      const expoCamera = require('expo-camera/build/index.js');
      const scanFromURLAsync = expoCamera?.Camera?.scanFromURLAsync as
        | ((url: string, barcodeTypes?: string[]) => Promise<Array<{ data?: string }>>)
        | undefined;

      if (!scanFromURLAsync) {
        setQrData(undefined);
        return;
      }

      const results = await scanFromURLAsync(uri, ['qr']);
      setQrData(results?.[0]?.data);
    } catch {
      setQrData(undefined);
    }
  }

  async function importFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'Photo library permission is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const uri = result.assets[0].uri;
    setImageUri(uri);
    await runOcr(uri);
    await decodeQrFromImage(uri);
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const uri = result.assets[0].uri;
    setImageUri(uri);
    await runOcr(uri);
    await decodeQrFromImage(uri);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AutoSpend Receipt Scanner</Text>
        <Text style={styles.subtitle}>iOS + Android · Camera + Gallery + OCR</Text>

        <View style={styles.actions}>
          <Button title="Import from Gallery" onPress={importFromGallery} />
          <Button title="Take Photo" onPress={takePhoto} />
        </View>

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}

        {isProcessing ? <Text style={styles.processing}>Processing OCR...</Text> : null}



        {qrData ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Decoded QR Data</Text>
            <Text selectable style={styles.rawText}>{qrData}</Text>
          </View>
        ) : null}

        {receiptData ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Extracted Receipt Data (MVP)</Text>
            <Text>To: {receiptData.toName ?? 'N/A'}</Text>
            <Text>Amount: {receiptData.amount ?? 'N/A'}</Text>
            <Text>Date/Time: {receiptData.dateTime ?? 'N/A'}</Text>
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
