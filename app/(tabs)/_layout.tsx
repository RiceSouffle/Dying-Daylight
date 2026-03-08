import { Tabs } from 'expo-router';
import { COLORS, FONTS } from '../../lib/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.black,
          borderTopColor: COLORS.darkGray,
          borderTopWidth: 0.5,
          height: 80,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: {
          fontFamily: FONTS.regular,
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today' }}
      />
      <Tabs.Screen
        name="archive"
        options={{ title: 'Archive' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}
