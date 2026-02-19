import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_profiles';
const RECENT_KEY = '@recent_searches';

export const getSavedProfiles = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

export const saveProfile = async (profile) => {
  try {
    const existing = await getSavedProfiles();
    const isDuplicate = existing.some(p => p.username === profile.username && p.platform === profile.platform);
    if (!isDuplicate) {
      const updated = [profile, ...existing];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { success: true, message: 'Profile Saved!' };
    }
    return { success: false, message: 'Already saved!' };
  } catch (e) { return { success: false, message: 'Error saving' }; }
};

export const deleteProfile = async (username, platform) => {
  const existing = await getSavedProfiles();
  const filtered = existing.filter(p => !(p.username === username && p.platform === platform));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// Recent Searches Logic
export const getRecentSearches = async () => {
  const data = await AsyncStorage.getItem(RECENT_KEY);
  return data ? JSON.parse(data) : [];
};

export const addRecentSearch = async (username) => {
  let list = await getRecentSearches();
  list = [username, ...list.filter(i => i !== username)].slice(0, 5);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(list));
};

export const deleteRecentSearch = async (username) => {
  let list = await getRecentSearches();
  list = list.filter(i => i !== username);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(list));
};