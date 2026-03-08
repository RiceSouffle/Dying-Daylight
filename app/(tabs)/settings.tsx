import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../hooks/useSettings';
import { scheduleDailyNotification, requestPermissions } from '../../lib/notifications';
import { COLORS, FONTS } from '../../lib/constants';

export default function SettingsScreen() {
  const { settings, updateSettings, loading } = useSettings();
  const insets = useSafeAreaInsets();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync input with loaded settings
  if (!apiKeyLoaded && !loading && settings.apiKey) {
    setApiKeyInput(settings.apiKey);
    setApiKeyLoaded(true);
  }
  if (!apiKeyLoaded && !loading && !settings.apiKey) {
    setApiKeyLoaded(true);
  }

  const handleSaveApiKey = async () => {
    setSaving(true);
    try {
      // Test the key with a minimal request if provided
      if (apiKeyInput.trim()) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKeyInput.trim(),
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250514',
            max_tokens: 16,
            messages: [{ role: 'user', content: 'Say "ok"' }],
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          Alert.alert(
            'Invalid API Key',
            err?.error?.message || `Error ${response.status}`
          );
          setSaving(false);
          return;
        }
      }

      await updateSettings({ apiKey: apiKeyInput.trim() });
      Alert.alert('Saved', apiKeyInput.trim() ? 'API key saved.' : 'API key removed.');
    } catch {
      Alert.alert('Error', 'Could not validate API key. Check your connection.');
    }
    setSaving(false);
  };

  const handleToggleNotifications = async (value: boolean) => {
    const newSettings = await updateSettings({ notificationsEnabled: value });
    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in your device settings to receive daily reflections.'
        );
        await updateSettings({ notificationsEnabled: false });
        return;
      }
    }
    await scheduleDailyNotification('Your daily reflection awaits.', newSettings);
  };

  const handleTimeChange = async (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      const newSettings = await updateSettings({
        notificationTime: {
          hour: date.getHours(),
          minute: date.getMinutes(),
        },
      });
      if (newSettings.notificationsEnabled) {
        await scheduleDailyNotification('Your daily reflection awaits.', newSettings);
      }
    }
  };

  const timeDate = new Date();
  timeDate.setHours(settings.notificationTime.hour);
  timeDate.setMinutes(settings.notificationTime.minute);

  const formatTime = (hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const m = String(minute).padStart(2, '0');
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:${m} ${ampm}`;
  };

  if (loading) return <View style={[styles.container, { paddingTop: insets.top }]} />;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.header}>Settings</Text>

      {/* API Key Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anthropic API Key</Text>
        <Text style={styles.hint}>
          Optional. Enables AI-generated reflections. Without a key, curated reflections are used.
        </Text>
        <TextInput
          style={styles.input}
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          placeholder="sk-ant-..."
          placeholderTextColor={COLORS.gray}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Your key is stored only on this device.
        </Text>
        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSaveApiKey}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Validating...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Notification</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enabled</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: COLORS.darkGray, true: COLORS.gray }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={timeDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
              themeVariant="dark"
            />
          ) : (
            <>
              <Pressable onPress={() => setShowTimePicker(true)}>
                <Text style={styles.timeText}>
                  {formatTime(
                    settings.notificationTime.hour,
                    settings.notificationTime.minute
                  )}
                </Text>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={timeDate}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </>
          )}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>Dying Daylight</Text>
        <Text style={styles.hint}>
          Each day, a gentle reminder of something impermanent — a relationship, a season, a phase of life.
        </Text>
        <Text style={[styles.hint, { marginTop: 8 }]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    paddingBottom: 120,
  },
  header: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    backgroundColor: COLORS.darkGray,
    color: COLORS.white,
    fontFamily: FONTS.regular,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.darkGray,
  },
  label: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
  timeText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.white,
  },
  aboutText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 4,
  },
});
