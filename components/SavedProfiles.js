import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getSavedProfiles, deleteProfile } from '../utils/storage';

export default function SavedProfiles({ onBack }) {
  const [list, setList] = useState([]);

  useEffect(() => { load(); }, []);
  const load = async () => setList(await getSavedProfiles());

  const remove = async (u, p) => {
    await deleteProfile(u, p);
    load();
  };

  const copy = async (text) => {
    await Clipboard.setStringAsync(text);
    alert('Copied!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bookmark" size={24} color="#0ea5e9" />
        <Text style={styles.title}>My Profiles</Text>
      </View>

      {list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No saved profiles yet</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.itemUser}>{item.username}</Text>
                <Text style={styles.itemPlatform}>{item.platform}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => copy(item.username)} style={styles.icon}>
                  <Ionicons name="copy-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.username, item.platform)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.back} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color="#94a3b8" />
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 18 },
  item: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: 18, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  itemUser: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemPlatform: { color: '#0ea5e9', fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 15 },
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  backText: { color: '#94a3b8', marginLeft: 10, fontSize: 16 }
});