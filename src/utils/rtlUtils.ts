import {I18nManager} from 'react-native';

/**
 * Check if the app is currently in RTL mode
 */
export const isRTL = (): boolean => I18nManager.isRTL;

/**
 * Get the flex direction based on current RTL setting
 */
export const getFlexDirection = (): 'row' | 'row-reverse' =>
  isRTL() ? 'row-reverse' : 'row';

/**
 * Get text alignment based on current RTL setting
 */
export const getTextAlign = (): 'left' | 'right' =>
  isRTL() ? 'right' : 'left';

/**
 * Get the start/end position names based on RTL
 */
export const getPositionNames = () => ({
  start: isRTL() ? 'right' : 'left',
  end: isRTL() ? 'left' : 'right',
});
