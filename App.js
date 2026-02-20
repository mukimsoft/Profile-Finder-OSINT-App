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

// --- PLATFORM DATA ---
const PLATFORMS = [
  { id: '0', name: 'None', icon: 'dot-circle', color: '#64748b', base: '' },
  { id: '1', name: 'GitHub', icon: 'github', color: '#fff', base: 'github.com/' },
  { id: '2', name: 'Facebook', icon: 'facebook', color: '#1877F2', base: 'facebook.com/' },
  { id: '3', name: 'Instagram', icon: 'instagram', color: '#E4405F', base: 'instagram.com/' },
  { id: '4', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', base: 'linkedin.com/in/' },
  { id: '5', name: 'Twitter', icon: 'twitter', color: '#1DA1F2', base: 'x.com/' },
  { id: '6', name: 'YouTube', icon: 'youtube', color: '#FF0000', base: 'youtube.com/@' },
];

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- 1. SEARCH SCREEN (HOME) ---
function SearchHome({ navigation }) {
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('username'); 
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImageAndSearch = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Gallery access required.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) {
      Alert.alert("OSINT Analysis", "Search image on:", [
        { text: "Google Lens", onPress: () => Linking.openURL(`https://www.google.com/searchbyimage?image_url=${result.assets[0].uri}`) },
        { text: "Cancel", style: "cancel" }
      ]);
    }
  };

  const startAnalysis = async () => {
    if (!input) return Alert.alert("Wait", `Please enter a ${type}.`);
    setLoading(true);
    Keyboard.dismiss();

    const cleanInput = input.trim();
    let resultData = {
      username: cleanInput,
      platform: platform.name,
      platformIcon: platform.icon,
      baseLink: platform.base,
      type: type,
      avatar: null,
      bio: `Deep scanning intelligence for ${type}: ${cleanInput}`,
      followers: 'Checking...',
      stats: 'Active',
      scanDate: new Date().toLocaleString()
    };

    if (platform.name === 'GitHub' && type === 'username') {
      try {
        const response = await fetch(`https://api.github.com/users/${cleanInput}`);
        const data = await response.json();
        if (data.login) {
          resultData.avatar = data.avatar_url;
          resultData.bio = data.bio || "No public bio found.";
          resultData.followers = data.followers + " Followers";
          resultData.stats = data.public_repos + " Repos";
        }
      } catch (e) { console.log(e); }
    }

    if (type === 'email' || type === 'phone') {
      resultData.platform = "Global Database";
      resultData.platformIcon = type === 'email' ? "envelope" : "phone-alt";
    }

    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Details', { data: resultData });
    }, 1200);
  };

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.full}>
      <SafeAreaView style={styles.flex1}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.flex1}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView contentContainerStyle={styles.homeScroll} keyboardShouldPersistTaps="handled">
            <View style={styles.mainContainer}>
              <View style={styles.heroBox}>
                <Image source={require('./assets/adaptive-icon.png')} style={styles.logoImg} resizeMode="contain" />
                <Text style={styles.subText}>INSTANT INTELLIGENCE INTERFACE</Text>
              </View>

              <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.actionPill} onPress={pickImageAndSearch}>
                      <Ionicons name="camera" size={18} color="#0ea5e9" />
                      <Text style={styles.pillTxt}>Image OSINT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionPill} onPress={() => setShowModal(true)}>
                      <FontAwesome5 name={platform.icon} size={16} color="#0ea5e9" />
                      <Text style={styles.pillTxt}>{platform.name}</Text>
                  </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSwitcher}>
                  {['username', 'email', 'phone', 'link'].map((t) => (
                    <TouchableOpacity 
                      key={t} 
                      style={[styles.typeBtn, type === t && styles.typeActive]} 
                      onPress={() => { setType(t); setInput(''); }}
                    >
                      <Text style={[styles.typeTxt, type === t && styles.typeActiveTxt]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput 
                  style={styles.mainInput}
                  placeholder={`Enter ${type}...`}
                  placeholderTextColor="#475569"
                  value={input}
                  onChangeText={setInput}
                  textAlign="center"
                  autoCapitalize="none"
                  keyboardType={type === 'phone' ? 'phone-pad' : type === 'email' ? 'email-address' : 'default'}
                />
              </View>

              <TouchableOpacity style={styles.mainBtn} onPress={startAnalysis}>
                <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.mainBtnGrad}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnTxt}>Run Analysis</Text>}
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

// --- 2. DETAILS SCREEN ---
function DetailsScreen({ route, navigation }) {
  const { data } = route.params;

  const handleVisit = () => {
    let url = "";
    if (data.type === 'email') url = `mailto:${data.username}`;
    else if (data.type === 'phone') url = `tel:${data.username}`;
    else url = data.type === 'link' ? (data.username.startsWith('http') ? data.username : `https://${data.username}`) : `https://${data.baseLink}${data.username}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Action not supported."));
  };

  const exportPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; background-color: #f8fafc; }
            .header { border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; margin-bottom: 30px; }
            .title { color: #0ea5e9; font-size: 28px; font-weight: bold; margin: 0; }
            .subtitle { color: #64748b; font-size: 14px; }
            .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .label { font-weight: bold; color: #0ea5e9; font-size: 12px; text-transform: uppercase; margin-top: 20px; }
            .value { font-size: 18px; color: #0f172a; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">OSINT INTELLIGENCE REPORT</h1>
            <p class="subtitle">Generated by Neurootix Interface • ${data.scanDate}</p>
          </div>
          <div class="card">
            <div class="label">Target Identity</div>
            <div class="value">${data.username}</div>
            
            <div class="label">Platform / Source</div>
            <div class="value">${data.platform} (${data.type})</div>
            
            <div class="label">Status / Engagement</div>
            <div class="value">${data.followers}</div>
            
            <div class="label">Data Points</div>
            <div class="value">${data.stats}</div>
            
            <div class="label">Intelligence Bio</div>
            <div class="value">${data.bio}</div>
          </div>
          <div class="footer">
            CONFIDENTIAL REPORT • NEUROOTIX OSINT SYSTEM v3.0
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Export Error", "Could not generate PDF report.");
    }
  };

  const secure = async () => {
    try {
      const saved = await AsyncStorage.getItem('saved_profiles');
      let arr = saved ? JSON.parse(saved) : [];
      arr.push({ ...data, id: Date.now().toString() });
      await AsyncStorage.setItem('saved_profiles', JSON.stringify(arr));
      Alert.alert("Secured", "Added to intelligence vault.");
    } catch (e) { Alert.alert("Error", "Failed to save."); }
  };

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.full}>
      <SafeAreaView style={[styles.flex1, styles.safeTop]}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBack}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
          <TouchableOpacity onPress={exportPDF} style={styles.exportBtn}>
            <Ionicons name="document-text" size={20} color="#0ea5e9" />
            <Text style={styles.exportTxt}>Export Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultCenter}>
          <View style={styles.card}>
            <View style={styles.avatar}>
              {data.avatar ? <Image source={{uri: data.avatar}} style={styles.imgFull} /> : <FontAwesome5 name={data.platformIcon || 'user-secret'} size={40} color="#0ea5e9" />}
            </View>
            <Text style={styles.resName}>{data.username}</Text>
            <View style={styles.resBadge}><Text style={styles.resBadgeTxt}>{data.platform} Scan</Text></View>
            <Text style={styles.resBio}>{data.bio}</Text>
            <View style={styles.resStats}>
               <View style={styles.sItem}><Text style={styles.sLab}>STATUS</Text><Text style={styles.sVal}>{data.followers}</Text></View>
               <View style={styles.sItem}><Text style={styles.sLab}>DATA</Text><Text style={styles.sVal}>{data.stats}</Text></View>
            </View>
            <View style={styles.resBtns}>
                <TouchableOpacity style={styles.vBtn} onPress={handleVisit}><Text style={styles.btnT}>{data.type === 'phone' ? 'Call' : data.type === 'email' ? 'Email' : 'Visit'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.sBtn} onPress={secure}><Text style={styles.btnT}>Secure</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- 3. VAULT SCREEN ---
function VaultScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const loadVault = async () => {
    const d = await AsyncStorage.getItem('saved_profiles');
    if (d) setItems(JSON.parse(d));
  };
  const deleteItem = async (id) => {
    Alert.alert("Delete", "Remove this profile?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const filtered = items.filter(i => i.id !== id);
        setItems(filtered);
        await AsyncStorage.setItem('saved_profiles', JSON.stringify(filtered));
      }}
    ]);
  };
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadVault);
    return unsubscribe;
  }, [navigation]);

  return (
    <LinearGradient colors={['#020617', '#0f172a']} style={styles.full}>
      <SafeAreaView style={[styles.flex1, styles.safeTop]}>
        <Text style={styles.vaultTitle}>Secured Assets</Text>
        <FlatList data={items} keyExtractor={item => item.id} renderItem={({item}) => (
          <View style={styles.vCard}>
             <View style={{flex: 1}}><Text style={{color:'#fff', fontWeight:'bold'}}>@{item.username}</Text><Text style={{color:'#0ea5e9', fontSize:12}}>{item.platform}</Text></View>
             <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.delBtn}><Ionicons name="trash-outline" size={18} color="#ef4444" /></TouchableOpacity>
          </View>
        )} ListEmptyComponent={<Text style={styles.emptyTxt}>No assets secured.</Text>} />
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- APP SETUP ---
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
  homeScroll: { flexGrow: 1, justifyContent: 'center' },
  mainContainer: { paddingHorizontal: 25, paddingVertical: 20 },
  heroBox: { alignItems: 'center', marginBottom: 20 },
  logoImg: { width: 400, height: 180 },
  subText: { color: '#0ea5e9', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginTop: -5 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionPill: { flex:1, backgroundColor: '#1e293b', padding: 12, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  pillTxt: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  searchContainer: { width: '100%', backgroundColor: '#1e293b', borderRadius: 25, padding: 10, borderWidth: 1, borderColor: '#334155' },
  typeSwitcher: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 18, padding: 5, marginBottom: 5 },
  typeBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15, marginRight: 5 },
  typeActive: { backgroundColor: '#0ea5e9' },
  typeTxt: { color: '#475569', fontSize: 12, fontWeight: 'bold' },
  typeActiveTxt: { color: '#fff' },
  mainInput: { color: '#fff', fontSize: 18, paddingVertical: 15 },
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
  resName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
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
  vaultTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', paddingHorizontal: 25, marginTop: 10 },
  vCard: { backgroundColor: '#1e293b', marginVertical: 8, padding: 20, borderRadius: 20, marginHorizontal: 25, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  delBtn: { backgroundColor: '#ef444415', padding: 8, borderRadius: 10 },
  emptyTxt: { color:'#475569', textAlign:'center', marginTop: 50 },
  mOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  mBox: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, width: '80%' },
  mHead: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  mRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  mClose: { marginTop: 15, alignSelf: 'center' }
});