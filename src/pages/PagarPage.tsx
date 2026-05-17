import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Spacing, FontSizes, BorderRadii } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { makePix, brlToCents, centsToBRL, formatBRL } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PagarPageProps {
  navigation?: any;
}

export const PagarPage: React.FC<PagarPageProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [chavePix, setChavePix] = useState('');
  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    const { data } = result;
    // Try to extract pix key from QR data
    Alert.alert(
      'QR Code detectado',
      'Deseja prosseguir com o pagamento?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
        {
          text: 'Prosseguir',
          onPress: () => {
            navigation?.navigate?.('Transferir', { chaveDestino: data });
          },
        },
      ]
    );
  };

  // Permission denied or not granted yet
  if (!permission) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: '#000' }]}>
        <MaterialCommunityIcons name="camera" size={48} color="rgba(255,255,255,0.5)" />
        <Text style={styles.loadingText}>Preparando câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#0A1628' : '#FFFFFF' }]}>
        <View style={[styles.permissionCard, { backgroundColor: isDark ? '#111D32' : '#F9FAFB' }]}>
          <MaterialCommunityIcons name="camera-outline" size={56} color={colors.accent} />
          <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>Acesso à câmera</Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            Para escanear QR Codes e realizar pagamentos, precisamos de acesso à câmera do seu dispositivo.
          </Text>
          <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: colors.accent }]} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Permitir acesso</Text>
          </TouchableOpacity>
        </View>

        {/* Manual input option */}
        <TouchableOpacity style={styles.manualToggle} onPress={() => setShowManualInput(true)}>
          <Text style={[styles.manualToggleText, { color: colors.accent }]}>
            Ou digite a chave Pix manualmente
          </Text>
        </TouchableOpacity>

        {showManualInput && (
          <View style={styles.manualInputSection}>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBgColor, borderColor: colors.inputBorder }]}>
              <MaterialCommunityIcons name="key-variant" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Digite a chave Pix"
                placeholderTextColor={colors.textMuted}
                value={chavePix}
                onChangeText={setChavePix}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={[styles.continueBtn, !chavePix && styles.continueBtnDisabled, { backgroundColor: chavePix ? colors.accent : colors.surfaceHover }]}
              onPress={() => {
                if (chavePix) {
                  navigation?.navigate?.('Transferir', { chaveDestino: chavePix });
                }
              }}
              disabled={!chavePix}
              activeOpacity={0.8}
            >
              <Text style={styles.continueText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Full-screen camera with overlay
  return (
    <View style={styles.container}>
      {/* Full-screen Camera */}
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Dark overlay with transparent center square */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />

          {/* Middle row with cutout */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              {/* Corner accents */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>

          {/* Bottom overlay */}
          <View style={styles.overlayBottom}>
            {/* Back button */}
            <TouchableOpacity style={[styles.overlayBackBtn, { top: insets.top + Spacing.md }]} onPress={() => navigation?.goBack?.()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Scan hint */}
            <Text style={styles.scanHint}>Aponte a câmera para o QR Code</Text>

            {/* Flip camera */}
            <TouchableOpacity style={styles.flipBtn} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
              <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Or type key */}
            <TouchableOpacity
              style={styles.manualInputBtn}
              onPress={() => setShowManualInput(!showManualInput)}
            >
              <MaterialCommunityIcons name="keyboard-outline" size={18} color="#FFFFFF" />
              <Text style={styles.manualInputText}>Digitar chave</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Manual input overlay */}
      {showManualInput && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.manualOverlay}>
          <View style={[styles.manualCard, { backgroundColor: isDark ? '#111D32' : '#FFFFFF' }]}>
            <View style={styles.manualCardHeader}>
              <Text style={[styles.manualCardTitle, { color: colors.textPrimary }]}>Digitar chave Pix</Text>
              <TouchableOpacity onPress={() => setShowManualInput(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.inputHint, { color: colors.textMuted }]}>CPF, CNPJ, e-mail ou chave aleatória</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBgColor, borderColor: colors.inputBorder }]}>
              <MaterialCommunityIcons name="key-variant" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Digite a chave Pix"
                placeholderTextColor={colors.textMuted}
                value={chavePix}
                onChangeText={setChavePix}
                autoCapitalize="none"
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[styles.continueBtn, !chavePix && styles.continueBtnDisabled, { backgroundColor: chavePix ? colors.accent : colors.surfaceHover }]}
              onPress={() => {
                if (chavePix) {
                  navigation?.navigate?.('Transferir', { chaveDestino: chavePix });
                }
              }}
              disabled={!chavePix}
              activeOpacity={0.8}
            >
              <Text style={styles.continueText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const SCAN_SIZE = 250;
const SIDE_OVERLAY = (SCREEN_WIDTH - SCAN_SIZE) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: FontSizes.md, marginTop: Spacing.md },
  // Camera
  camera: { flex: 1 },
  overlay: { flex: 1 },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  overlaySide: {
    width: SIDE_OVERLAY,
    height: SCAN_SIZE,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10B981',
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
  },
  overlayBackBtn: {
    position: 'absolute', top: Spacing.md, left: Spacing.xxl,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  scanHint: {
    color: '#FFFFFF', fontSize: FontSizes.lg, fontWeight: '600',
    marginTop: Spacing.md,
  },
  flipBtn: {
    position: 'absolute', top: Spacing.md, right: Spacing.xxl,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  manualInputBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadii.lg,
  },
  manualInputText: { color: '#FFFFFF', fontSize: FontSizes.md, fontWeight: '500' },
  // Permission
  permissionCard: {
    width: '85%',
    borderRadius: BorderRadii.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  permissionTitle: { fontSize: FontSizes.xxl, fontWeight: '700', marginTop: Spacing.lg },
  permissionText: { fontSize: FontSizes.md, textAlign: 'center', marginTop: Spacing.md, lineHeight: 22 },
  permissionBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadii.lg,
  },
  permissionBtnText: { color: '#FFFFFF', fontSize: FontSizes.lg, fontWeight: '700' },
  manualToggle: { marginTop: Spacing.xl },
  manualToggleText: { fontSize: FontSizes.md, fontWeight: '500' },
  // Manual input section (no camera)
  manualInputSection: {
    width: '85%',
    marginTop: Spacing.xl,
  },
  // Manual overlay (when camera is available)
  manualOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  manualCard: {
    borderTopLeftRadius: BorderRadii.xxl,
    borderTopRightRadius: BorderRadii.xxl,
    padding: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  manualCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  manualCardTitle: { fontSize: FontSizes.xxl, fontWeight: '700' },
  inputHint: { fontSize: FontSizes.sm, marginBottom: Spacing.sm },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadii.lg, borderWidth: 1,
    paddingHorizontal: Spacing.lg, height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  input: { flex: 1, fontSize: FontSizes.lg },
  continueBtn: {
    flexDirection: 'row', borderRadius: BorderRadii.lg,
    height: 56, justifyContent: 'center', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing.lg,
    elevation: 3,
  },
  continueBtnDisabled: {},
  continueText: { color: '#FFFFFF', fontSize: FontSizes.xxl, fontWeight: '700' },
});
