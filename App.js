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

const { width, height } = Dimensions.get('window');

const PLATFORMS = [
  { id: '0', name: 'None', icon: 'ban', color: '#64748b' },
  { id: '1', name: 'GitHub', icon: 'github', color: '#fff' },
  { id: '2', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { id: '3', name: 'Instagram', icon: 'instagram', color: '#E4405F' },
  { id: '4', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
  { id: '5', name: 'Twitter', icon: 'twitter', color: '#1DA1F2' },
  { id: '6', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
];

export default function App() {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('username');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState([]);
  const [saved, setSaved] = useState([]);
  const [view, setView] = useState('home');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const r = await AsyncStorage.getItem('recents');
      const s = await AsyncStorage.getItem('saved');
      if (r) setRecents(JSON.parse(r));
      if (s) setSaved(JSON.parse(s));
    } catch (e) { console.log("Load Error", e); }
  };

  const handleSearch = async (val = input) => {
    const searchText = val || input;
    if (platform.name === 'None') { alert("Please select a platform!"); setShowModal(true); return; }
    if (!searchText) return;

    Keyboard.dismiss();
    setLoading(true);

    const newRecents = [searchText, ...recents.filter(i => i !== searchText)].slice(0, 5);
    setRecents(newRecents);
    await AsyncStorage.setItem('recents', JSON.stringify(newRecents));

    let profileData = {
      id: Date.now().toString(),
      username: searchText,
      platform: platform.name,
      platformIcon: platform.icon,
      type: type,
      avatar: null,
      bio: `${platform.name} intelligence analysis for ${searchText}`
    };

    if (platform.name === 'GitHub' && type === 'username') {
      try {
        const res = await fetch(`https://api.github.com/users/${searchText}`);
        const data = await res.json();
        if (data.login) { 
          profileData.avatar = data.avatar_url; 
          profileData.bio = data.bio || profileData.bio; 
        }
      } catch (e) {}
    }

    setTimeout(() => { setResult(profileData); setLoading(false); }, 700);
  };

  const saveProfile = async () => {
    if (saved.some(s => s.username === result.username && s.platform === result.platform)) {
      alert("Already saved!");
      return;
    }
    const newSaved = [result, ...saved];
    setSaved(newSaved);
    await AsyncStorage.setItem('saved', JSON.stringify(newSaved));
    alert("Profile Saved!");
  };

  const deleteSaved = (id) => {
    Alert.alert("Delete", "Remove this profile?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const filtered = saved.filter(item => item.id !== id);
          setSaved(filtered);
          await AsyncStorage.setItem('saved', JSON.stringify(filtered));
        }
      }
    ]);
  };

  const deleteRecent = async (item) => {
    const filtered = recents.filter(i => i !== item);
    setRecents(filtered);
    await AsyncStorage.setItem('recents', JSON.stringify(filtered));
  };

  const openLink = (item) => {
    let url = item.type === 'link' ? (item.username.startsWith('http') ? item.username : `https://${item.username}`) : `https://${item.platform.toLowerCase()}.com/${item.username}`;
    if (item.platform === 'YouTube') url = `https://youtube.com/@${item.username}`;
    Linking.openURL(url);
  };

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }}>
        
        {result ? (
          <View style={styles.previewContainer}>
            <TouchableOpacity onPress={() => setResult(null)} style={styles.backCircleStandalone}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.resultCard}>
              <View style={styles.avatarWrap}>
                {result.avatar ? <Image source={{ uri: result.avatar }} style={styles.avatarImg} /> : <FontAwesome5 name={result.platformIcon} size={50} color="#0ea5e9" />}
              </View>
              <Text style={styles.resName}>{result.username}</Text>
              <Text style={styles.badgeText}>{result.platform}</Text>
              <Text style={styles.resBio}>{result.bio}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openLink(result)}><Text style={styles.btnText}>Visit</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#334155'}]} onPress={saveProfile}><Text style={styles.btnText}>Save</Text></TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ) : view === 'home' ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollInner} keyboardShouldPersistTaps="handled">
              
              {}
              <View style={styles.header}>
                <Image source={require('./assets/logo.png')} style={styles.heroLogo} resizeMode="contain" />
                <Text style={styles.tagline}>INSTANT INTELLIGENCE ACROSS PLATFORMS</Text>
              </View>

              <View style={styles.lowerSection}>
                <View style={styles.topRow}>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => setView('saved')}>
                    <Ionicons name="bookmark" size={18} color="#0ea5e9" /><Text style={styles.miniBtnText}>Saved Profiles</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniBtn} onPress={() => setShowModal(true)}>
                    <FontAwesome5 name={platform.icon} size={16} color="#0ea5e9" /><Text style={styles.miniBtnText}>{platform.name === 'None' ? 'Platform' : platform.name}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputCard}>
                  <View style={styles.tabRow}>
                    <TouchableOpacity style={[styles.tab, type === 'username' && styles.activeTab]} onPress={() => setType('username')}><Text style={[styles.tabText, type === 'username' && styles.activeTabText]}>Username</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, type === 'link' && styles.activeTab]} onPress={() => setType('link')}><Text style={[styles.tabText, type === 'link' && styles.activeTabText]}>URL Link</Text></TouchableOpacity>
                  </View>
                  <TextInput 
                    style={styles.mainInput} 
                    placeholder={type === 'username' ? "Enter @username" : "Paste link here..."} 
                    placeholderTextColor="#475569"
                    value={input}
                    onChangeText={setInput}
                    textAlign="center"
                    autoCapitalize="none"
                    selection={input.length === 0 ? {start: 0, end: 0} : undefined}
                  />
                </View>

                {recents.length > 0 && (
                  <View style={styles.recentBox}>
                    <Text style={styles.recentTitle}>RECENT SEARCHES</Text>
                    {recents.map((item, idx) => (
                      <View key={idx} style={styles.recentItem}>
                        <TouchableOpacity style={{flex:1}} onPress={() => { setInput(item); handleSearch(item); }}>
                          <Text style={{color: '#94a3b8'}}>{item}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteRecent(item)}><Ionicons name="close-circle" size={18} color="#334155" /></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()}>
                  <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.searchGrad}>
                    {loading ? <ActivityIndicator color="#fff" /> : <View style={{flexDirection:'row', alignItems:'center'}}><Text style={styles.searchBtnText}>Search Now</Text><Ionicons name="search" size={20} color="#fff" style={{marginLeft:10}}/></View>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          
          <View style={styles.savedView}>
            <TouchableOpacity onPress={() => setView('home')} style={styles.backCircleStandalone}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.titleSection}>
              <Text style={styles.title}>Saved Intelligence</Text>
              <Text style={styles.subtitle}>{saved.length} profiles secured</Text>
            </View>

            <ScrollView style={{marginTop: 10}} showsVerticalScrollIndicator={false}>
              {saved.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="cloud-offline-outline" size={50} color="#1e293b" />
                  <Text style={{color: '#475569', marginTop: 10}}>No saved profiles yet.</Text>
                </View>
              ) : (
                saved.map((item) => (
                  <View key={item.id} style={styles.sItem}>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', flex: 1}} onPress={() => openLink(item)}>
                      <View style={[styles.platformIconBg, {backgroundColor: '#0ea5e915'}]}>
                         <FontAwesome5 name={item.platformIcon} size={16} color="#0ea5e9" />
                      </View>
                      <View style={{marginLeft: 12}}>
                        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>{item.username}</Text>
                        <Text style={{color: '#475569', fontSize: 10, textTransform: 'uppercase'}}>{item.platform}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSaved(item.id)} style={styles.delBtn}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Platform</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close-circle" size={26} color="#475569" /></TouchableOpacity>
              </View>
              <FlatList 
                data={PLATFORMS}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.pItem} onPress={() => { setPlatform(item); setShowModal(false); }}>
                    <FontAwesome5 name={item.icon} size={18} color={item.color} style={{width: 30}} />
                    <Text style={{color: '#fff', fontSize: 16, flex: 1}}>{item.name}</Text>
                    {platform.id === item.id && <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" />}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
        <Text style={styles.footer}>Developed by Neurootix</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollInner: { flexGrow: 1, paddingHorizontal: 25, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  heroLogo: { width: width * 2.00, height: 130 },
  tagline: { color: '#64748b', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginTop: -10 },
  lowerSection: { marginTop: 30 },
  topRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  miniBtn: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  miniBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 8 },
  inputCard: { backgroundColor: '#1e293b', borderRadius: 22, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  tabRow: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 14, padding: 5, marginBottom: 5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#0ea5e9' },
  tabText: { color: '#475569', fontSize: 13, fontWeight: '800' },
  activeTabText: { color: '#fff' },
  mainInput: { color: '#fff', fontSize: 18, paddingVertical: 18, fontWeight: '600' },
  recentBox: { marginBottom: 20 },
  recentTitle: { color: '#475569', fontSize: 10, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  searchBtn: { borderRadius: 20, overflow: 'hidden', marginTop: 10 },
  searchGrad: { padding: 20, alignItems: 'center' },
  searchBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  
  // সেভড স্ক্রিন ফিক্স
  savedView: { flex: 1, paddingHorizontal: 25, paddingTop: Platform.OS === 'ios' ? 30 : 50 },
  backCircleStandalone: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginBottom: 20 },
  titleSection: { marginBottom: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  subtitle: { color: '#475569', fontSize: 13, marginTop: 4 },
  
  sItem: { backgroundColor: '#1e293b', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  platformIconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  delBtn: { padding: 10, backgroundColor: '#ef444408', borderRadius: 12 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  
  previewContainer: { flex: 1, padding: 25, justifyContent: 'center' },
  resultCard: { borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#334155', backgroundColor: '#1e293b' },
  avatarWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  resName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  badgeText: { color: '#0ea5e9', fontWeight: 'bold', marginVertical: 10, fontSize: 14 },
  resBio: { color: '#94a3b8', textAlign: 'center', fontSize: 13, lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: 15, marginTop: 25 },
  actionBtn: { backgroundColor: '#0ea5e9', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15 },
  btnText: { color: '#fff', fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  pItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  footer: { textAlign: 'center', color: '#334155', fontSize: 11, paddingBottom: 20 }
});