import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  Image, SafeAreaView, ActivityIndicator, Keyboard, 
  ScrollView, StatusBar, Linking, Modal, FlatList, Alert, Platform, KeyboardAvoidingView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import TextRecognition from '@react-native-ml-kit/text-recognition';

// --- PLATFORM DATA ---
const PLATFORMS = [
  { id: '0', name: 'None', icon: 'dot-circle', color: '#64748b', base: '' },
  { id: '1', name: 'Neurootix', icon: 'shield-alt', color: '#6611b5', base: 'https://neurootix.com/' },
  { id: '2', name: 'GitHub', icon: 'github', color: '#fff', base: 'https://github.com/' },
  { id: '3', name: 'Facebook', icon: 'facebook', color: '#1877F2', base: 'https://facebook.com/' },
  { id: '4', name: 'Instagram', icon: 'instagram', color: '#E4405F', base: 'https://instagram.com/' },
  { id: '5', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', base: 'https://linkedin.com/in/' },
  { id: '6', name: 'Twitter', icon: 'twitter', color: '#1DA1F2', base: 'https://x.com/' },
  { id: '7', name: 'YouTube', icon: 'youtube', color: '#FF0000', base: 'https://youtube.com/@' },
];

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- SEARCH SCREEN ---
function SearchHome({ navigation }) {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('username'); 
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOcrScan = async () => {
    try {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (camStatus !== 'granted' || libStatus !== 'granted') {
        return Alert.alert("Permission Required", "Camera and Gallery access are needed for OCR scanning.");
      }

      Alert.alert("Select Source", "Choose an image to extract text", [
        { text: "Camera", onPress: () => performOcr('camera') },
        { text: "Gallery", onPress: () => performOcr('library') },
        { text: "Cancel", style: "cancel" }
      ]);
    } catch (err) { Alert.alert("Error", "OCR initialization failed."); }
  };

  const performOcr = async (source) => {
    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({ quality: 1 });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    }

    if (!result.canceled) {
      setLoading(true);
      try {
        const response = await TextRecognition.recognize(result.assets[0].uri);
        if (response && response.text) {
          setInput(response.text.trim());
          Alert.alert("Success", "Text extracted successfully.");
        } else {
          Alert.alert("OCR Result", "No readable text found.");
        }
      } catch (e) {
        Alert.alert("ML Kit Error", "OCR processing is only supported on real devices with a Development Build. It won't work in Expo Go.");
      } finally { setLoading(false); }
    }
  };

  const pickImageAndSearch = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert("Permission Denied", "Gallery access required.");
      let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 1 });
      if (!result.canceled) {
        Alert.alert("Intelligence Scan", "Local images must be uploaded to Google Lens for full OSINT analysis.", [
          { text: "OPEN LENS", onPress: () => Linking.openURL('https://lens.google.com/upload') },
          { text: "CANCEL", style: "cancel" }
        ]);
      }
    } catch (err) { Alert.alert("Error", "Could not process image."); }
  };

  const startAnalysis = async () => {
    if (!input) return Alert.alert("Wait", `Please enter text.`);
    setLoading(true); Keyboard.dismiss();
    const cleanInput = input.trim();
    const isFullLink = cleanInput.startsWith('http') || cleanInput.startsWith('www');
    
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 9);

    let resultData = {
      id: uniqueId,
      username: cleanInput, 
      platform: platform.name,
      platformIcon: platform.icon,
      baseLink: isFullLink ? "" : platform.base,
      type: type,
      avatar: null,
      bio: isFullLink ? `Full link analysis for ${platform.name} source.` : `OSINT scanning active for ${platform.name} entry.`,
      followers: isFullLink ? 'Source Verified' : 'Checking...',
      stats: isFullLink ? 'EXTERNAL LINK' : 'Active',
      scanDate: new Date().toLocaleString()
    };

    if (platform.name === 'GitHub' && type === 'username' && !isFullLink) {
      try {
        const response = await fetch(`https://api.github.com/users/${cleanInput}`);
        const data = await response.json();
        if (data.login) {
          resultData.avatar = data.avatar_url;
          resultData.bio = data.bio || "No public bio found.";
          resultData.followers = data.followers;
          resultData.stats = data.public_repos;
        }
      } catch (e) { console.log(e); }
    } else if (!isFullLink) {
        resultData.followers = "Engagement Data";
        resultData.stats = type.toUpperCase();
        resultData.bio = `Analysis of ${cleanInput} on ${platform.name} is complete.`;
    }
    
    setTimeout(() => { setLoading(false); navigation.navigate('Details', { data: resultData }); }, 1000);
  };

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.full}>
      <SafeAreaView style={styles.flex1}>
        {/* লোগো অংশ ফিক্সড রাখার জন্য ScrollView এর বাইরে রাখা হয়েছে */}
        <View style={styles.heroBoxFixed}>
          <Image source={require('./assets/adaptive-icon.png')} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.subText}>INSTANT INTELLIGENCE INTERFACE</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex1}>
          <ScrollView contentContainerStyle={styles.homeScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.mainContainer}>
              
              <View style={styles.quickActions}>
                  <TouchableOpacity style={[styles.actionPill, {flex: 1}]} onPress={pickImageAndSearch}>
                      <Ionicons name="camera" size={16} color="#0ea5e9" />
                      <Text style={[styles.pillTxt, {fontSize: 11}]}>OSINT</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionPill, {flex: 1, borderColor: '#10b981'}]} onPress={handleOcrScan}>
                      <Ionicons name="scan-outline" size={16} color="#10b981" />
                      <Text style={[styles.pillTxt, {fontSize: 11, color: '#10b981'}]}>SCAN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionPill, {flex: 1}]} onPress={() => setShowModal(true)}>
                      <FontAwesome5 name={platform.icon} size={14} color={platform.color} />
                      <Text style={[styles.pillTxt, {fontSize: 11}]}>{platform.name}</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSwitcher}>
                  {['username', 'email', 'phone', 'link'].map((t) => (
                    <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeActive]} onPress={() => { setType(t); setInput(''); }}>
                      <Text style={[styles.typeTxt, type === t && styles.typeActiveTxt]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput 
                  style={styles.mainInput} 
                  placeholder={`Paste text or enter ${type}...`} 
                  placeholderTextColor="#475569" 
                  value={input} 
                  onChangeText={setInput} 
                  textAlign="center" 
                  autoCapitalize="none" 
                  multiline
                />
              </View>

              <TouchableOpacity style={styles.mainBtn} onPress={startAnalysis}>
                <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.mainBtnGrad}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnTxt}>Analysis</Text>}
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.footerBrand}>Developed by Neurootix</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.mOverlay}>
          <View style={styles.mBox}>
            <Text style={styles.mHead}>Select Network</Text>
            <FlatList data={PLATFORMS} keyExtractor={i => i.id} renderItem={({item}) => (
              <TouchableOpacity style={styles.mRow} onPress={() => { setPlatform(item); setShowModal(false); }}>
                <FontAwesome5 name={item.icon} size={18} color={item.color} style={{width: 35}} />
                <Text style={{color: '#fff', fontSize: 16}}>{item.name}</Text>
              </TouchableOpacity>
            )} />
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.mClose}><Text style={{color:'#ef4444', fontWeight:'bold'}}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// --- DETAILS SCREEN ---
function DetailsScreen({ route, navigation }) {
  const { data } = route.params;

  const openProfileLink = () => {
    const target = data.username.trim();
    
    if (data.type === 'email') {
      Linking.openURL(`mailto:${target}`).catch(() => Alert.alert("Error", "Mail app not found"));
      return;
    }
    
    if (data.type === 'phone') {
      Linking.openURL(`tel:${target}`).catch(() => Alert.alert("Error", "Dialer not found"));
      return;
    }

    if (target.startsWith('http') || target.startsWith('www')) {
        const fullUrl = target.startsWith('www') ? `https://${target}` : target;
        Linking.openURL(fullUrl).catch(() => Alert.alert("Error", "Invalid Link"));
    } else if (data.baseLink) {
        Linking.openURL(`${data.baseLink}${target}`).catch(() => Alert.alert("Error", "Could not open profile"));
    } else {
        Alert.alert("Link Unavailable", "This data has no associated platform link.");
    }
  };

  const saveProfile = async () => {
    try {
      const existing = await AsyncStorage.getItem('saved_profiles');
      let arr = existing ? JSON.parse(existing) : [];
      
      const exists = arr.some(item => item.id === data.id);
      if(exists) {
          data.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      }

      arr.unshift(data);
      await AsyncStorage.setItem('saved_profiles', JSON.stringify(arr));
      Alert.alert("Saved", "Profile saved to vault.");
    } catch (e) { Alert.alert("Error", "Could not save profile."); }
  };

const exportPDF = async () => {
    const bioContent = data.bio ? `<div class="info-row"><b>BIO:</b> ${data.bio}</div>` : '';
    const statsContent = data.platform === 'GitHub' ? `
      <div class="info-row"><b>REPOSITORIES:</b> ${data.stats}</div>
      <div class="info-row"><b>FOLLOWERS:</b> ${data.followers}</div>
    ` : `
      <div class="info-row"><b>STATUS:</b> ${data.followers}</div>
      <div class="info-row"><b>DATA TYPE:</b> ${data.stats}</div>
    `;

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { border-bottom: 3px solid #0ea5e9; padding-bottom: 15px; margin-bottom: 30px; }
            .platform-title { font-size: 24px; font-weight: bold; color: #0ea5e9; text-transform: uppercase; }
            .date { font-size: 12px; color: #64748b; margin-top: 5px; }
            .main-id { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #334155; word-wrap: break-word; }
            .content-area { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
            .info-row { margin-bottom: 10px; border-left: 3px solid #e2e8f0; padding-left: 10px; }
            .footer { position: fixed; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="platform-title">${data.platform} Intelligence Report</div>
            <div class="date">REPORT GENERATED: ${data.scanDate}</div>
          </div>
          <div class="content-area">
            <div class="main-id">TARGET: ${data.username}</div>
            ${bioContent}
            ${statsContent}
          </div>
          <div class="footer">CONFIDENTIAL NEUROOTIX OSINT SYSTEM v3.0</div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert("Error", "Could not generate full report.");
    }
  };

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.full}>
      <SafeAreaView style={[styles.flex1, styles.safeTop]}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBack}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
          <View style={{flexDirection:'row', gap:10}}>
            <TouchableOpacity onPress={saveProfile} style={styles.exportBtn}>
              <Ionicons name="bookmark" size={20} color="#10b981" />
              <Text style={[styles.exportTxt,{color:'#10b981'}]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={exportPDF} style={styles.exportBtn}>
              <Ionicons name="share-social" size={20} color="#0ea5e9" />
              <Text style={styles.exportTxt}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{paddingBottom: 40}}>
          <View style={styles.resultCenter}>
            <View style={styles.card}>
              <View style={styles.avatar}>
                {data.avatar ? <Image source={{uri: data.avatar}} style={styles.imgFull} /> : <FontAwesome5 name={data.platformIcon || 'user'} size={40} color="#0ea5e9" />}
              </View>
              <Text style={styles.resName}>{data.username}</Text>
              <View style={styles.resBadge}><Text style={styles.resBadgeTxt}>{data.platform}</Text></View>
              <Text style={styles.resBio}>{data.bio}</Text>
              
              <View style={styles.resStats}>
                <View style={styles.sItem}>
                  <Text style={styles.sLab}>{data.platform === 'GitHub' ? 'FOLLOWERS' : 'STATUS'}</Text>
                  <Text style={styles.sVal}>{data.followers}</Text>
                </View>
                <View style={styles.sItem}>
                  <Text style={styles.sLab}>{data.platform === 'GitHub' ? 'REPOSITORIES' : 'DATA POINTS'}</Text>
                  <Text style={styles.sVal}>{data.stats}</Text>
                </View>
              </View>
              
              <View style={styles.resBtns}>
                  <TouchableOpacity style={[styles.vBtn, {backgroundColor: '#334155'}]} onPress={() => navigation.goBack()}><Text style={styles.btnT}>Back</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.sBtn, {backgroundColor: '#0ea5e9'}]} onPress={openProfileLink}>
                    <Text style={styles.btnT}>
                      {data.type === 'email' ? 'Send Mail' : data.type === 'phone' ? 'Call Now' : 'Go Profile'}
                    </Text>
                  </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- VAULT ---
function VaultScreen({ navigation }) {
  const [items, setItems] = useState([]);
  
  const loadVault = async () => { 
    const d = await AsyncStorage.getItem('saved_profiles'); 
    if (d) setItems(JSON.parse(d)); 
  };

  const deleteItem = async (id) => {
    Alert.alert("Delete Asset", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
        const filtered = items.filter(i => i.id !== id);
        setItems(filtered);
        await AsyncStorage.setItem('saved_profiles', JSON.stringify(filtered));
      }}
    ]);
  };

  const deleteAll = async () => {
    if (items.length === 0) return;
    Alert.alert("Clear Vault", "Do you want to delete all secured assets?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: 'destructive', onPress: async () => {
        setItems([]);
        await AsyncStorage.removeItem('saved_profiles');
      }}
    ]);
  };

  useEffect(() => { return navigation.addListener('focus', loadVault); }, [navigation]);

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.full}>
      <SafeAreaView style={[styles.flex1, styles.safeTop]}>
        <View style={styles.vaultHeader}>
          <Text style={styles.vaultTitle}>Secured Assets</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={deleteAll} style={styles.deleteAllBtn}>
              <Ionicons name="trash-bin-outline" size={18} color="#ef4444" />
              <Text style={styles.deleteAllTxt}>Delete All</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList 
          data={items} 
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} 
          renderItem={({item}) => (
          <View style={styles.vCard}>
             <View style={{flex: 1}}>
                <Text style={{color:'#fff', fontWeight:'bold', fontSize: 14}}>@{item.username}</Text>
                <Text style={{color: '#0ea5e9', fontSize:11, marginTop: 2}}>{item.platform}</Text>
             </View>
             <TouchableOpacity onPress={() => deleteItem(item.id)} style={{padding: 8}}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
          </View>
        )} ListEmptyComponent={<Text style={styles.emptyTxt}>No assets secured yet.</Text>} />
      </SafeAreaView>
    </LinearGradient>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={SearchHome} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false, tabBarStyle: styles.tabBar, tabBarActiveTintColor: '#0ea5e9', tabBarInactiveTintColor: '#475569',
        tabBarIcon: ({ color, size }) => {
          let icon = route.name === 'Search' ? 'search' : 'shield-checkmark';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}>
        <Tab.Screen name="Search" component={SearchStack} />
        <Tab.Screen name="Vault" component={VaultScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 }, flex1: { flex: 1 },
  safeTop: { paddingTop: Platform.OS === 'android' ? 45 : 10 },
  homeScroll: { flexGrow: 1, justifyContent: 'flex-start' }, 
  mainContainer: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 20 }, 
  heroBoxFixed: { alignItems: 'center', marginBottom: 15, marginTop: 20, width: '100%' }, 
  logoImg: { width: '180%', height: 150 }, 
  subText: { color: '#0ea5e9', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginTop: -5 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionPill: { backgroundColor: '#1e293b', padding: 12, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  pillTxt: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  searchContainer: { width: '100%', backgroundColor: '#1e293b', borderRadius: 25, padding: 10, borderWidth: 1, borderColor: '#334155' },
  typeSwitcher: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 18, padding: 5, marginBottom: 5 },
  typeBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, marginRight: 5 },
  typeActive: { backgroundColor: '#0ea5e9' },
  typeTxt: { color: '#475569', fontSize: 12, fontWeight: 'bold' },
  typeActiveTxt: { color: '#fff' },
  mainInput: { color: '#fff', fontSize: 16, paddingVertical: 15, minHeight: 60 },
  mainBtn: { width: '100%', borderRadius: 25, overflow: 'hidden', marginTop: 25 },
  mainBtnGrad: { padding: 18, alignItems: 'center' },
  mainBtnTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerBrand: { color: '#475569', fontSize: 9, textAlign: 'center', marginTop: 30, letterSpacing: 1, fontWeight: '600' },
  tabBar: { backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#1e293b', height: 70, paddingBottom: 12 },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 25 },
  circleBack: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 10 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#334155' },
  exportTxt: { color: '#0ea5e9', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  resultCenter: { flex: 1, justifyContent: 'center', padding: 25 },
  card: { backgroundColor: '#1e293b', borderRadius: 30, padding: 25, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#0ea5e9', overflow:'hidden' },
  imgFull: { width: '100%', height: '100%' },
  resName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resBadge: { backgroundColor: '#0ea5e915', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  resBadgeTxt: { color: '#0ea5e9', fontSize: 10, fontWeight: 'bold' },
  resBio: { color: '#94a3b8', textAlign: 'center', fontSize: 13, marginVertical: 15 },
  resStats: { flexDirection: 'row', width: '100%', paddingVertical: 15, borderTopWidth: 1, borderColor: '#334155' },
  sItem: { flex: 1, alignItems: 'center' },
  sLab: { color: '#475569', fontSize: 8, fontWeight: 'bold' },
  sVal: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  resBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  vBtn: { flex: 1, backgroundColor: '#0ea5e9', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  sBtn: { flex: 1, backgroundColor: '#334155', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vaultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 10, marginBottom: 10 },
  vaultTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  deleteAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef444420', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#ef444450' },
  deleteAllTxt: { color: '#ef4444', fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
  vCard: { backgroundColor: '#1e293b', marginVertical: 8, padding: 18, borderRadius: 20, marginHorizontal: 25, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  emptyTxt: { color:'#475569', textAlign:'center', marginTop: 50 },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  mBox: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, width: '80%' },
  mHead: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  mRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  mClose: { marginTop: 15, alignSelf: 'center' }
});