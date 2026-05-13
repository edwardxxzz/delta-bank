import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadii } from '../types';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onPagar: () => void;
  onTransferir: () => void;
  onReceber: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ visible, onClose, onPagar, onTransferir, onReceber }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuCard}>
              {/* Triangle pointer at top */}
              <View style={styles.pointerContainer}>
                <View style={styles.pointer} />
              </View>

              <Text style={styles.menuTitle}>Ações rápidas</Text>

              <TouchableOpacity style={styles.menuItem} onPress={onPagar} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: Colors.pagarBg }]}>
                  <MaterialCommunityIcons name="qrcode-scan" size={22} color={Colors.pagarIcon} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>Pagar com Pix</Text>
                  <Text style={styles.menuSub}>Escaneie ou digite a chave</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={onTransferir} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: Colors.transferirBg }]}>
                  <MaterialCommunityIcons name="swap-horizontal-bold" size={22} color={Colors.transferirIcon} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>Transferir</Text>
                  <Text style={styles.menuSub}>Envie Pix para alguém</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={onReceber} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: Colors.pixBg }]}>
                  <MaterialCommunityIcons name="qrcode" size={22} color={Colors.pixIcon} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>Receber</Text>
                  <Text style={styles.menuSub}>Gere QR Code ou compartilhe chave</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    paddingBottom: 90,
    paddingHorizontal: Spacing.lg,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadii.xl,
    padding: Spacing.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  pointerContainer: {
    alignItems: 'center',
    marginBottom: -8,
    marginTop: -32,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderLeftColor: 'transparent',
    borderRightWidth: 16,
    borderRightColor: 'transparent',
    borderBottomWidth: 20,
    borderBottomColor: Colors.white,
  },
  menuTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
