import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { saveProfile } from '../utils/storage';

export default function GitHubPreview({ data, onBack }) {
  const handleSave = async () => {
    const res = await saveProfile({ username: data.login, platform: 'GitHub', avatar: data.avatar_url });
    alert(res.message);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: data.avatar_url }} style={styles.avatar} />
      <Text style={styles.name}>{data.name || data.login}</Text>
      <Text style={styles.username}>@{data.login}</Text>
      <Text style={styles.bio} numberOfLines={2}>{data.bio || "No bio available"}</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{data.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{data.public_repos}</Text>
          <Text style={styles.statLabel}>Repos</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.openBtn} onPress={() => Linking.openURL(data.html_url)}>
        <Text style={styles.openBtnText}>Open Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} style={{ marginTop: 15 }}>
        <Text style={{ color: '#94a3b8' }}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 20, padding: 25, alignItems: 'center', width: '90%', alignSelf: 'center', borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 15, borderWidth: 3, borderColor: '#0ea5e9' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  username: { color: '#0ea5e9', fontSize: 16, marginBottom: 10 },
  bio: { color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 25 },
  statBox: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: '#64748b', fontSize: 12 },
  openBtn: { backgroundColor: '#0ea5e9', width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  openBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#334155', width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});