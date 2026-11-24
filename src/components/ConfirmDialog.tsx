import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMotion, useTheme } from '@/theme';
import { BigButton } from './BigButton';
import { Mascot } from './mascot';

interface ConfirmDialogProps {
  visible: boolean;
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A calm, rare confirmation (R1.13): one short question from Ace, a big primary answer at the
 * usual lower-right position and a secondary one beside it. Never auto-dismisses; the Android
 * back button means "not yet".
 */
export function ConfirmDialog({
  visible,
  question,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={motion.level === 'none' ? 'none' : 'fade'}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={[styles.root, { backgroundColor: theme.colors.backdrop }]}>
        <View
          style={[
            styles.panel,
            {
              backgroundColor: theme.colors.velvetRaised,
              borderColor: theme.colors.gold,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              margin: theme.spacing.md,
              marginBottom: insets.bottom + theme.spacing.md,
              gap: theme.spacing.lg,
            },
          ]}
        >
          <Mascot pose="thinking" />
          <Text accessibilityRole="header" style={theme.text.title}>
            {question}
          </Text>
          <View style={[styles.row, { gap: theme.touch.gap }]}>
            <BigButton
              variant="secondary"
              label={cancelLabel}
              onPress={onCancel}
              style={styles.secondary}
            />
            <BigButton label={confirmLabel} onPress={onConfirm} style={styles.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  panel: { borderWidth: 2 },
  row: { flexDirection: 'row' },
  secondary: { flex: 1 },
  primary: { flex: 1.4 },
});
