import type { ExpoConfig, ConfigContext } from 'expo/config';

function pluginName(plugin: unknown) {
  return Array.isArray(plugin) ? plugin[0] : plugin;
}

/** Native map keys are injected only into generated native configuration, never into extra. */
export default ({ config }: ConfigContext): ExpoConfig => {
  const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim();
  const iosGoogleMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY?.trim();
  const plugins = [...(config.plugins ?? [])];

  if (!plugins.some(plugin => pluginName(plugin) === 'expo-location')) {
    plugins.push(['expo-location', {
      locationWhenInUsePermission: 'Allow Meraki Homes to use your location when you choose a service location.',
    }]);
  }

  const hasMapsPlugin = plugins.some(plugin => pluginName(plugin) === 'react-native-maps');
  if (!hasMapsPlugin && (androidGoogleMapsApiKey || iosGoogleMapsApiKey)) {
    plugins.push(['react-native-maps', {
      ...(androidGoogleMapsApiKey ? { androidGoogleMapsApiKey } : {}),
      ...(iosGoogleMapsApiKey ? { iosGoogleMapsApiKey } : {}),
    }]);
  }

  return {
    ...config,
    plugins,
    android: {
      ...config.android,
      package: config.android?.package || 'com.merakihomes.mobile',
      ...(androidGoogleMapsApiKey ? { config: { ...config.android?.config, googleMaps: { apiKey: androidGoogleMapsApiKey } } } : {}),
    },
    ios: {
      ...config.ios,
      bundleIdentifier: config.ios?.bundleIdentifier || 'com.merakihomes.mobile',
      ...(iosGoogleMapsApiKey ? { config: { ...config.ios?.config, googleMapsApiKey: iosGoogleMapsApiKey } } : {}),
    },
    extra: {
      ...config.extra,
      googleMapsAndroidConfigured: Boolean(androidGoogleMapsApiKey),
      googleMapsIosConfigured: Boolean(iosGoogleMapsApiKey),
    },
  };
};
