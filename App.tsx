import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as TextRecognition from 'react-native-text-recognition';
import { parseReceiptText } from './src/ocrParser';
import { DEFAULT_CATEGORIES, ExpenseCategory, ExpenseSource, ReceiptData, Transaction } from './src/types';

const HOURS_6_MS = 6 * 60 * 60 * 1000;

export default function App() {
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [receiptData, setReceiptData] = useState<ReceiptData | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  const [reviewAmount, setReviewAmount] = useState('');
  const [reviewMerchant, setReviewMerchant] = useState('');
  const [reviewCategory, setReviewCategory] = useState<ExpenseCategory>('other');
  const [reviewSource, setReviewSource] = useState<ExpenseSource>('receipt');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<'all' | ExpenseCategory>('all');

  async function runOcr(uri: string) {
    try {
      setIsProcessing(true);
      const lines = await TextRecognition.recognize(uri);
      const parsed = parseReceiptText(lines);
      setReceiptData(parsed);
      setReviewAmount(parsed.amount ?? '');
      setReviewMerchant(parsed.merchant ?? '');
      setReviewCategory(parsed.category ?? 'other');
      setReviewSource('receipt');
    } catch {
      Alert.alert('OCR failed', 'Unable to extract text from this image.');
    } finally {
      setIsProcessing(false);
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
  }

  function parseNumber(value: string): number | null {
    const amount = Number.parseFloat(value.replace(/[^\d.]/g, ''));
    return Number.isFinite(amount) ? amount : null;
  }

  function similarMerchant(a: string, b: string): boolean {
    const first = a.trim().toLowerCase();
    const second = b.trim().toLowerCase();
    return first.length > 2 && second.length > 2 && (first.includes(second) || second.includes(first));
  }

  function findDuplicate(candidate: Transaction): Transaction | undefined {
    return transactions.find((entry) => {
      const sameAmount = entry.amount === candidate.amount;
      const sameDay = entry.date.slice(0, 10) === candidate.date.slice(0, 10);
      const similarTime = Math.abs(new Date(entry.date).getTime() - new Date(candidate.date).getTime()) <= HOURS_6_MS;
      const merchantMatch = similarMerchant(entry.merchant, candidate.merchant);
      const sourceDifferent = entry.source !== candidate.source;
      return sameAmount && sameDay && similarTime && merchantMatch && sourceDifferent;
    });
  }

  function saveManualReview() {
    const amount = parseNumber(reviewAmount);
    if (!amount) {
      Alert.alert('Invalid amount', 'Please confirm an amount before saving.');
      return;
    }

    const merchant = reviewMerchant.trim();
    if (!merchant) {
      Alert.alert('Missing merchant', 'Please enter a merchant before saving.');
      return;
    }

    const tx: Transaction = {
      id: `${Date.now()}`,
      amount,
      merchant,
      category: reviewCategory,
      date: new Date().toISOString(),
      source: reviewSource
    };

    const duplicate = findDuplicate(tx);
    if (duplicate) {
      Alert.alert(
        'Possible duplicate detected',
        `Matches ${duplicate.source} transaction: ${duplicate.merchant} · $${duplicate.amount.toFixed(2)}`
      );
    }

    setTransactions((prev) => [tx, ...prev]);
    Alert.alert('Saved', 'Transaction added to timeline.');
  }

  const filteredTransactions = useMemo(() => {
    if (timelineFilter === 'all') {
      return transactions;
    }
    return transactions.filter((tx) => tx.category === timelineFilter);
  }, [timelineFilter, transactions]);

  const insights = useMemo(() => {
    const now = new Date();
    const thisMonth = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
    });

    const thisMonthSpend = thisMonth.reduce((sum, tx) => sum + tx.amount, 0);
    const byCategory = new Map<ExpenseCategory, number>();
    const byMerchant = new Map<string, number>();

    thisMonth.forEach((tx) => {
      byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount);
      byMerchant.set(tx.merchant, (byMerchant.get(tx.merchant) ?? 0) + tx.amount);
    });

    const topCategory = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'other';
    const daysSoFar = Math.max(1, now.getUTCDate());
    const averageDailySpend = thisMonthSpend / daysSoFar;
    const recentMerchants = Array.from(new Set(transactions.slice(0, 5).map((tx) => tx.merchant)));

    return {
      thisMonthSpend,
      topCategory,
      averageDailySpend,
      recentMerchants
    };
  }, [transactions]);

  const dailyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filteredTransactions.forEach((tx) => {
      const day = tx.date.slice(0, 10);
      totals.set(day, (totals.get(day) ?? 0) + tx.amount);
    });
    return Array.from(totals.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const monthlyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filteredTransactions.forEach((tx) => {
      const month = tx.date.slice(0, 7);
      totals.set(month, (totals.get(month) ?? 0) + tx.amount);
    });
    return Array.from(totals.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AutoSpend Receipt Scanner</Text>
        <Text style={styles.subtitle}>Review OCR, save expenses, and track timeline insights.</Text>

        <View style={styles.actions}>
          <Button title="Import from Gallery" onPress={importFromGallery} />
          <Button title="Take Photo" onPress={takePhoto} />
        </View>

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
        {isProcessing ? <Text style={styles.processing}>Processing OCR...</Text> : null}

        {receiptData ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>B. Manual review</Text>
            <TextInput
              value={reviewAmount}
              onChangeText={setReviewAmount}
              placeholder="Confirm amount"
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <TextInput
              value={reviewMerchant}
              onChangeText={setReviewMerchant}
              placeholder="Edit merchant"
              style={styles.input}
            />

            <Text style={styles.label}>Source</Text>
            <View style={styles.choiceRow}>
              {(['receipt', 'email'] as ExpenseSource[]).map((source) => (
                <Text
                  key={source}
                  style={[styles.chip, reviewSource === source && styles.chipSelected]}
                  onPress={() => setReviewSource(source)}>
                  {source}
                </Text>
              ))}
            </View>

            <Text style={styles.label}>Edit category</Text>
            <View style={styles.choiceRow}>
              {DEFAULT_CATEGORIES.map((category) => (
                <Text
                  key={category}
                  style={[styles.chip, reviewCategory === category && styles.chipSelected]}
                  onPress={() => setReviewCategory(category)}>
                  {category}
                </Text>
              ))}
            </View>
            <Button title="Save" onPress={saveManualReview} />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>C. Expense timeline</Text>
          <View style={styles.choiceRow}>
            <Text style={[styles.chip, timelineFilter === 'all' && styles.chipSelected]} onPress={() => setTimelineFilter('all')}>
              all
            </Text>
            {DEFAULT_CATEGORIES.map((category) => (
              <Text
                key={category}
                style={[styles.chip, timelineFilter === category && styles.chipSelected]}
                onPress={() => setTimelineFilter(category)}>
                {category}
              </Text>
            ))}
          </View>

          {filteredTransactions.map((tx) => (
            <Text key={tx.id}>
              {new Date(tx.date).toLocaleString()} · ${tx.amount.toFixed(2)} · {tx.merchant} · {tx.category}
            </Text>
          ))}

          <Text style={styles.sectionLabel}>Daily totals</Text>
          {dailyTotals.map(([day, total]) => (
            <Text key={day}>
              {day}: ${total.toFixed(2)}
            </Text>
          ))}

          <Text style={styles.sectionLabel}>Monthly totals</Text>
          {monthlyTotals.map(([month, total]) => (
            <Text key={month}>
              {month}: ${total.toFixed(2)}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>E. Basic insights</Text>
          <Text>This month spending: ${insights.thisMonthSpend.toFixed(2)}</Text>
          <Text>Top category: {insights.topCategory}</Text>
          <Text>Average daily spend: ${insights.averageDailySpend.toFixed(2)}</Text>
          <Text>Recent merchants: {insights.recentMerchants.join(', ') || 'none'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>F. Duplicate detection</Text>
          <Text>
            Save entries as receipt or email. AutoSpend flags possible duplicates when amount, day, merchant, and
            nearby time are similar.
          </Text>
        </View>
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
  input: {
    backgroundColor: '#f2f4f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  label: {
    fontWeight: '600'
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e5e9ef',
    borderRadius: 16,
    overflow: 'hidden'
  },
  chipSelected: {
    backgroundColor: '#afd0ff'
  },
  sectionLabel: {
    marginTop: 6,
    fontWeight: '700'
  }
});
