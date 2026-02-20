import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, SafeAreaView, ActivityIndicator, Keyboard, 
  KeyboardAvoidingView, ScrollView, Platform, StatusBar,
  Dimensions, Linking, Modal, FlatList, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const PLATFORMS = [
  { id: '0', name: 'None', icon: 'ban', color: '#64748b', base: '' },
  { id: '1', name: 'GitHub', icon: 'github', color: '#fff', base: 'github.com/' },
  { id: '2', name: 'Facebook', icon: 'facebook', color: '#1877F2', base: 'facebook.com/' },
  { id: '3', name: 'Instagram', icon: 'instagram', color: '#E4405F', base: 'instagram.com/' },
  { id: '4', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', base: 'linkedin.com/in/' },
  { id: '5', name: 'Twitter', icon: 'twitter', color: '#1DA1F2', base: 'x.com/' },
  { id: '6', name: 'YouTube', icon: 'youtube', color: '#FF0000', base: 'youtube.com/@' },
];

export default function App() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('username'); 
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]);
  const [view, setView] = useState('home');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const s = await AsyncStorage.getItem('saved');
      if (s) setSaved(JSON.parse(s));
    } catch (e) { console.log(e); }
  };

  const handleSearch = async () => {
    if (platform.id === '0') { Alert.alert("Wait", "Select a platform first!"); setShowModal(true); return; }
    if (!input) return;

    Keyboard.dismiss();
    setLoading(true);

    const cleanUsername = input.replace('@', '').trim();
    let profileData = {
      id: Date.now().toString(),
      username: cleanUsername,
      platform: platform.name,
      platformIcon: platform.icon,
      baseLink: platform.base,
      type: type,
      avatar: null,
      bio: `Scanning ${platform.name} for ${cleanUsername}...`,
      followers: 'Pending',
      stats: 'Active',
      location: null
    };

    if (platform.name === 'GitHub' && type === 'username') {
      try {
        const res = await fetch(`https://api.github.com/users/${cleanUsername}`);
        const data = await res.json();
        if (data.login) { 
          profileData.avatar = data.avatar_url; 
          profileData.bio = data.bio || "No public bio.";
          profileData.followers = data.followers + " follower";
          profileData.stats = data.public_repos + " Repos";
        }
      } catch (e) {}
    }

    setTimeout(() => { setResult(profileData); setLoading(false); }, 800);
  };

  const openLink = (item) => {
    const url = item.type === 'link' ? (item.username.startsWith('http') ? item.username : `https://${item.username}`) : `https://${item.baseLink}${item.username}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Broken link."));
  };

  const saveProfile = async () => {
    const isExist = saved.some(s => s.username === result.username && s.platform === result.platform);
    if (isExist) { Alert.alert("Exist", "Already in Vault."); return; }
    const newSaved = [result, ...saved];
    setSaved(newSaved);
    await AsyncStorage.setItem('saved', JSON.stringify(newSaved));
    Alert.alert("Success", "Intelligence Secured.");
  };

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        
        {result ? (
          /* --- RESULT CARD --- */
          <View style={styles.flex1}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => setResult(null)} style={styles.backCircle}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.cardWrapper}>
                <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.resCard}>
                    <View style={styles.avatarCircle}>
                        {result.avatar ? <Image source={{ uri: result.avatar }} style={styles.imgFull} /> : <FontAwesome5 name={result.platformIcon} size={40} color="#0ea5e9" />}
                    </View>
                    <Text style={styles.resUser}>@{result.username}</Text>
                    <View style={styles.pBadge}>
                        <FontAwesome5 name={result.platformIcon} size={11} color="#0ea5e9" />
                        <Text style={styles.pBadgeTxt}>{result.platform}</Text>
                    </View>
                    <Text style={styles.resBio} numberOfLines={3}>{result.bio}</Text>
                    <View style={styles.statGrid}>
                        <View style={styles.sItem}><Text style={styles.sLabel}>STATUS</Text><Text style={styles.sVal}>{result.followers}</Text></View>
                        <View style={styles.sDiv} />
                        <View style={styles.sItem}><Text style={styles.sLabel}>DATA</Text><Text style={styles.sVal}>{result.stats}</Text></View>
                    </View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.btnV} onPress={() => openLink(result)}><Text style={styles.btnT}>Visit</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.btnS} onPress={saveProfile}><Text style={styles.btnT}>Secure</Text></TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
          </View>
        ) : view === 'home' ? (
          /* --- HOME VIEW (LOGO & UI FIXED) --- */
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : "height"} style={styles.flex1}>
            <ScrollView contentContainerStyle={styles.homeContent}>
              
              {/* --- অরিজিনাল লোগো সেকশন --- */}
              <View style={styles.logoContainer}>
                <Image source={require('./assets/adaptive-icon.png')} style={styles.mainLogo} resizeMode="contain" />
                <Text style={styles.subTag}>INSTANT INTELLIGENCE ACROSS PLATFORMS</Text>
              </View>

              <View style={styles.topBtnRow}>
                <TouchableOpacity style={styles.pill} onPress={() => setView('saved')}>
                    <Ionicons name="bookmark" size={18} color="#0ea5e9" />
                    <Text style={styles.pillTxt}>Saved Profiles</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pill} onPress={() => setShowModal(true)}>
                    <Ionicons name="grid" size={18} color="#0ea5e9" />
                    <Text style={styles.pillTxt}>{platform.name === 'None' ? 'Platform' : platform.name}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchBox}>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity style={[styles.togglePill, type === 'username' && styles.activePill]} onPress={() => setType('username')}>
                    <Text style={[styles.toggleT, type === 'username' && styles.activeT]}>Username</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.togglePill, type === 'link' && styles.activePill]} onPress={() => setType('link')}>
                    <Text style={[styles.toggleT, type === 'link' && styles.activeT]}>URL Link</Text>
                  </TouchableOpacity>
                </View>
                <TextInput 
                  style={styles.mainInput} 
                  placeholder={type === 'username' ? "Enter @username" : "Enter Link..."} 
                  placeholderTextColor="#475569"
                  value={input}
                  onChangeText={setInput}
                  textAlign="center"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.searchGrad}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnTxt}>Search Now  <Ionicons name="search" size={18} color="#fff" /></Text>}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          /* --- SAVED ASSETS --- */
          <View style={styles.flex1}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setView('home')} style={styles.backCircle}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Secured Assets</Text>
            </View>
            <ScrollView style={{padding: 20}}>
                {saved.map((item) => (
                  <View key={item.id} style={styles.saveItem}>
                    <TouchableOpacity style={{flex: 1}} onPress={() => openLink(item)}>
                      <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.username}</Text>
                      <Text style={{color: '#475569', fontSize: 12}}>{item.platform}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        const f = saved.filter(i => i.id !== item.id);
                        setSaved(f);
                        AsyncStorage.setItem('saved', JSON.stringify(f));
                    }}><Ionicons name="trash" size={20} color="#ef4444" /></TouchableOpacity>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Platform Selection Modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.mOverlay}>
            <View style={styles.mContent}>
              <Text style={styles.mTitle}>Select Platform</Text>
              <FlatList data={PLATFORMS} keyExtractor={i => i.id} renderItem={({item}) => (
                <TouchableOpacity style={styles.mRow} onPress={() => { setPlatform(item); setShowModal(false); }}>
                  <FontAwesome5 name={item.icon} size={18} color={item.color} style={{width: 35}} />
                  <Text style={{color: '#fff', fontSize: 16}}>{item.name}</Text>
                </TouchableOpacity>
              )} />
              <TouchableOpacity onPress={() => setShowModal(false)} style={{marginTop: 15, alignSelf: 'center'}}><Text style={{color: '#0ea5e9'}}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        <Text style={styles.devTag}>Developed by Neurootix</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0 },
  flex1: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  backCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  homeContent: { flexGrow: 1, padding: 25, alignItems: 'center' },
  
  // লোগো এবং টাইটেল ডিজাইন
  logoContainer: { alignItems: 'center', marginVertical: 30 },
  mainLogo: { width: 600, height: 100 },
  mainTitle: { color: '#0ea5e9', fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  subTag: { color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, marginTop: 5 },
  
  topBtnRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 20 },
  pill: { flex: 1, backgroundColor: '#1e293b', padding: 18, borderRadius: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  pillTxt: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 10 },
  
  searchBox: { width: '100%', backgroundColor: '#1e293b', borderRadius: 25, padding: 8, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 18, padding: 5 },
  togglePill: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 15 },
  activePill: { backgroundColor: '#0ea5e9' },
  toggleT: { color: '#475569', fontSize: 13, fontWeight: 'bold' },
  activeT: { color: '#fff' },
  mainInput: { color: '#fff', fontSize: 18, paddingVertical: 20 },
  
  searchBtn: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  searchGrad: { padding: 20, alignItems: 'center' },
  searchBtnTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  cardWrapper: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  resCard: { borderRadius: 30, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#0ea5e9', overflow: 'hidden' },
  imgFull: { width: '100%', height: '100%' },
  resUser: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  pBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0ea5e915', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginTop: 8 },
  pBadgeTxt: { color: '#0ea5e9', fontSize: 12, fontWeight: 'bold', marginLeft: 8 },
  resBio: { color: '#94a3b8', textAlign: 'center', fontSize: 14, marginVertical: 20 },
  statGrid: { flexDirection: 'row', width: '100%', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#334155', marginVertical: 10 },
  sItem: { flex: 1, alignItems: 'center' },
  sDiv: { width: 1, height: '100%', backgroundColor: '#334155' },
  sLabel: { color: '#475569', fontSize: 10, fontWeight: 'bold' },
  sVal: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 15 },
  btnV: { flex: 1, backgroundColor: '#0ea5e9', paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  btnS: { flex: 1, backgroundColor: '#334155', paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: 'bold' },
  
  saveItem: { backgroundColor: '#1e293b', padding: 20, borderRadius: 20, flexDirection: 'row', marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 35 },
  mContent: { backgroundColor: '#1e293b', borderRadius: 25, padding: 25 },
  mTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  mRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155', alignItems: 'center' },
  devTag: { textAlign: 'center', color: '#334155', fontSize: 11, paddingVertical: 15 }
});