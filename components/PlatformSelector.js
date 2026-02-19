import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, Entypo, AntDesign } from '@expo/vector-icons';

// প্ল্যাটফর্মের আইকন এবং কালার কনফিগারেশন
const platforms = [
  { name: 'None', icon: 'ban', color: '#64748b', type: 'FontAwesome5' },
  { name: 'GitHub', icon: 'github', color: '#fff', type: 'FontAwesome5' },
  { name: 'LinkedIn', icon: 'linkedin', color: '#0a66c2', type: 'FontAwesome5' },
  { name: 'Instagram', icon: 'instagram', color: '#e4405f', type: 'FontAwesome5' },
  { name: 'X (Twitter)', icon: 'twitter', color: '#1da1f2', type: 'FontAwesome5' },
  { name: 'Facebook', icon: 'facebook', color: '#1877f2', type: 'FontAwesome5' },
  { name: 'YouTube', icon: 'youtube', color: '#ff0000', type: 'FontAwesome5' },
];

export default function PlatformSelector({ visible, onClose, onSelect, selectedPlatform }) {
  
  const renderIcon = (platform) => {
    return <FontAwesome5 name={platform.icon} size={20} color={platform.color} />;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Platform</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {platforms.map((item) => (
              <TouchableOpacity 
                key={item.name} 
                style={[
                  styles.item, 
                  selectedPlatform === item.name && { borderColor: item.color, borderWidth: 1.5 }
                ]}
                onPress={() => onSelect(item.name)}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    {renderIcon(item)}
                  </View>
                  <Text style={[styles.itemText, selectedPlatform === item.name && { color: '#fff', fontWeight: 'bold' }]}>
                    {item.name}
                  </Text>
                </View>
                {selectedPlatform === item.name && (
                  <Ionicons name="checkmark-circle" size={22} color={item.color} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modal: { 
    backgroundColor: '#1e293b', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 25, 
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#334155'
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  item: { 
    padding: 14, 
    borderRadius: 15, 
    marginBottom: 12, 
    backgroundColor: '#0f172a', 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  itemText: { color: '#94a3b8', fontSize: 17 },
});