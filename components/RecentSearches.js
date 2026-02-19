import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecentSearches({ searches, onSelect, onDelete }) {
  if (searches.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {searches.map((item, index) => (
          <View key={index} style={styles.chip}>
            <TouchableOpacity onPress={() => onSelect(item)}>
              <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item)} style={styles.delete}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 15, width: '100%' },
  chip: { flexDirection: 'row', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  text: { color: '#fff', fontSize: 14 },
  delete: { marginLeft: 8 }
});