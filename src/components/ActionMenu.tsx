import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onPagar: () => void;
  onTransferir: () => void;
  onDepositar: () => void;
  onReceber: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ visible, onClose, onPagar, onTransferir, onDepositar, onReceber }) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.menuCard, { backgroundColor: colors.sectionCardBg }]}>
              {/* Triangle pointer at top */}
              <View style={styles.pointerContainer}>
                <View style={[styles.pointer, { borderBottomColor: colors.sectionCardBg }]} />
              </View>

              <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Ações rápidas</Text>

              <TouchableOpacity style={styles.menuItem} onPress={onTransferir} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: colors.transferirBg }]}>
                  <MaterialCommunityIcons name="swap-horizontal-bold" size={22} color={colors.transferirIcon} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Pix</Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Envie Pix para alguém</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.menuDivider }]} />

              <TouchableOpacity style={styles.menuItem} onPress={onPagar} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: colors.pagarBg }]}>
                  <MaterialCommunityIcons name="qrcode-scan" size={22} color={colors.pagarIcon} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Pagar com Pix</Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Escaneie ou digite a chave</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.menuDivider }]} />

              <TouchableOpacity style={styles.menuItem} onPress={onDepositar} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: colors.depositarBg }]}>
                  <MaterialCommunityIcons name="cash-plus" size={22} color={colors.depositarIcon} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Depositar</Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Adicione dinheiro à conta</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.menuDivider }]} />

              <TouchableOpacity style={styles.menuItem} onPress={onReceber} activeOpacity={0.7}>
                <View style={[styles.menuIcon, { backgroundColor: colors.pixBg }]}>
                  <MaterialCommunityIcons name="qrcode" size={22} color={colors.pixIcon} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Receber</Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>Gere QR Code ou compartilhe chave</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
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
  },
  menuTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
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
    marginBottom: 2,
  },
  menuSub: {
    fontSize: FontSizes.sm,
  },
  divider: {
    height: 1,
  },
});
