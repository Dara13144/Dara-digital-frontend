import { useEffect, useCallback } from 'react';

/**
 * Hook to interface with the official Telegram WebApp SDK
 */
export function useTelegram() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Set theme colors to match the dark crimson wine background
      try {
        if (tg.setHeaderColor) {
          tg.setHeaderColor('#600011');
        }
        if (tg.setBackgroundColor) {
          tg.setBackgroundColor('#46000c');
        }
        if (tg.setBottomBarColor) {
          tg.setBottomBarColor('#46000c');
        }
      } catch (e) {
        // ignore if not supported by client
      }
      // Enable closing confirmation to prevent accidental swipes on mobile
      if (tg.enableClosingConfirmation) {
        tg.enableClosingConfirmation();
      }
    }
  }, [tg]);

  const showMainButton = useCallback(
    (text, onClick, isProgress = false) => {
      if (!tg?.MainButton) return;
      tg.MainButton.setText(text);
      tg.MainButton.show();
      if (isProgress) {
        tg.MainButton.showProgress();
      } else {
        tg.MainButton.hideProgress();
      }
      if (onClick) {
        tg.MainButton.onClick(onClick);
      }
    },
    [tg]
  );

  const hideMainButton = useCallback(() => {
    if (!tg?.MainButton) return;
    tg.MainButton.hide();
  }, [tg]);

  const showBackButton = useCallback(
    (onClick) => {
      if (!tg?.BackButton) return;
      tg.BackButton.show();
      if (onClick) {
        tg.BackButton.onClick(onClick);
      }
    },
    [tg]
  );

  const hideBackButton = useCallback(() => {
    if (!tg?.BackButton) return;
    tg.BackButton.hide();
  }, [tg]);

  const haptic = useCallback(
    (type = 'light') => {
      if (!tg?.HapticFeedback) return;
      try {
        if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(type)) {
          tg.HapticFeedback.impactOccurred(type);
        } else if (['error', 'success', 'warning'].includes(type)) {
          tg.HapticFeedback.notificationOccurred(type);
        } else if (type === 'selection') {
          tg.HapticFeedback.selectionChanged();
        }
      } catch (err) {
        // Silently ignore if haptics unsupported
      }
    },
    [tg]
  );

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    initData: tg?.initData || '',
    colorScheme: tg?.colorScheme || 'dark',
    themeParams: tg?.themeParams || {},
    viewportHeight: tg?.viewportHeight,
    isExpanded: tg?.isExpanded,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    haptic,
    isTelegramWebApp: Boolean(tg?.initData && tg.initData.length > 0) || typeof window !== 'undefined' && Boolean(window.TelegramWebview),
    openTelegramApp: (startParam = 'store') => {
      const url = `https://t.me/DaraDigital_bot?start=${startParam}`;
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(url);
      } else if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    },
    close: () => tg?.close()
  };
}
