'use client';

import { useCallback, useEffect, useRef } from 'react';
import { DialogOptions, DialogType, authDialogStore } from '@/stores/auth-dialog-store';

/**
 * Interface for the auth dialog hook
 */
interface AuthDialogHook {
  // State
  activeDialog: DialogType;
  dialogOptions: DialogOptions;

  // Actions
  openDialog: (dialog: DialogType, options?: DialogOptions) => void;
  closeDialog: () => void;
}

/**
 * Hook for managing authentication dialogs
 * @returns Auth dialog state and actions
 */
export const useAuthDialog = (): AuthDialogHook => {
  // Get state from store
  const activeDialog = authDialogStore((state) => state.activeDialog);
  const dialogOptions = authDialogStore((state) => state.dialogOptions);
  const setActiveDialog = authDialogStore((state) => state.setActiveDialog);
  const setDialogOptions = authDialogStore((state) => state.setDialogOptions);

  // Track previous dialog to detect changes
  const previousDialogRef = useRef<DialogType>(null);

  // Open dialog with options
  const openDialog = useCallback(
    (dialog: DialogType, options: DialogOptions = {}) => {
      // Only change if it's a different dialog
      if (dialog !== activeDialog) {
        // Store the current dialog before changing
        previousDialogRef.current = activeDialog;
      }

      setDialogOptions(options);
      setActiveDialog(dialog);
    },
    [activeDialog, setActiveDialog, setDialogOptions],
  );

  // Close dialog
  const closeDialog = useCallback(() => {
    // Store the current dialog before closing
    previousDialogRef.current = activeDialog;
    setActiveDialog(null);
  }, [activeDialog, setActiveDialog]);

  // Effect to detect dialog changes
  useEffect(() => {
    // Update the previous dialog reference
    previousDialogRef.current = activeDialog;
  }, [activeDialog]);

  return {
    // State
    activeDialog,
    dialogOptions,

    // Actions
    openDialog,
    closeDialog,
  };
};

export default useAuthDialog;
