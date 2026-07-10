/** English labels for Settings and Profile UI. */

import { MAX_CUSTOM_WALLPAPERS } from "@/config/wallpapers";
import {
  UI_LABEL_CANCEL,
  UI_LABEL_DELETE,
  UI_LABEL_SAVE,
} from "@/config/ui-labels";

export { UI_LABEL_CANCEL, UI_LABEL_DELETE, UI_LABEL_SAVE };

export const SETTINGS_TITLE = "Settings";
export const SETTINGS_DONE = "Done";
export const SETTINGS_CLOSE_SETTINGS = "Close settings";
export const SETTINGS_ACCOUNT = "Account";
export const SETTINGS_APPEARANCE = "Appearance";
export const SETTINGS_DISPLAY_MODE = "Display mode";
export const SETTINGS_ACCENT_COLOR = "Accent color";
export const SETTINGS_GLASS_BLUR = "Glass blur";
export const SETTINGS_WALLPAPER = "Wallpaper";

export const SETTINGS_DISPLAY_MODE_FOOTER =
  "Light, dark, or follow your device preference.";
export const SETTINGS_ACCENT_COLOR_FOOTER =
  "Sets button and highlight colors across the app.";
export const SETTINGS_GLASS_BLUR_FOOTER =
  "Adjust blur and transparency of glass panels across the app.";
export const SETTINGS_THEME_MODE_ARIA = "Theme mode";
export const SETTINGS_GLASS_BLUR_LEVEL_ARIA = "Glass blur level";
export const SETTINGS_TRANSPARENCY = "Transparency";
export const SETTINGS_GLASS_PANEL_TRANSPARENCY_ARIA = "Glass panel transparency";
export const SETTINGS_TRANSPARENT = "Transparent";
export const SETTINGS_WALLPAPER_FOOTER =
  "Choose a preset or upload a photo. The mask helps text stay readable over wallpapers.";

export const SETTINGS_NOTIFICATIONS = "Notifications";
export const SETTINGS_PUSH_NOTIFICATIONS = "Push notifications";
export const SETTINGS_PUSH_FOOTER =
  "Upcoming bills, AI summaries, and important alerts.";

export const SETTINGS_SIGN_OUT = "Sign out";
export const SETTINGS_SIGNING_OUT = "Signing out...";

export const SETTINGS_DEFAULT_USER = "User";
export const SETTINGS_EMAIL_UNAVAILABLE = "Email unavailable";

export const PROFILE_TITLE = "Profile";
export const PROFILE_DESC = "Manage your account and change password.";
export const PROFILE_ACCOUNT = "Account";
export const PROFILE_LOADING = "Loading profile...";

export const PROFILE_CHANGE_PASSWORD = "Change password";
export const PROFILE_CHANGE_PASSWORD_DESC =
  "Enter your current and new password.";
export const PROFILE_CURRENT_PASSWORD = "Current password";
export const PROFILE_NEW_PASSWORD = "New password";
export const PROFILE_CONFIRM_PASSWORD = "Confirm new password";
export const PROFILE_SAVE_PASSWORD = "Save password";
export const PROFILE_SAVING_PASSWORD = "Saving...";
export const PROFILE_PASSWORD_MIN_LENGTH =
  "New password must be at least 8 characters.";
export const PROFILE_PASSWORD_MISMATCH = "Password confirmation does not match.";
export const PROFILE_PASSWORD_CHANGE_FAILED = "Failed to change password.";
export const PROFILE_PASSWORD_UPDATED = "Password updated successfully.";

export const PUSH_ERROR_UNSUPPORTED =
  "This browser does not support push notifications.";
export const PUSH_ERROR_PERMISSION_DENIED = "Notification permission denied.";
export const PUSH_ERROR_NOT_CONFIGURED =
  "Push notifications are not configured on the server.";
export const PUSH_ERROR_SERVICE_WORKER =
  "Failed to register the service worker.";
export const PUSH_ERROR_INVALID_SUBSCRIPTION = "Invalid push subscription.";
export const PUSH_ERROR_SAVE_SUBSCRIPTION = "Failed to save push subscription.";
export const PUSH_ERROR_ENABLE_FAILED = "Failed to enable notifications.";

export const WALLPAPER_MASK_ACCESSIBILITY = "Accessibility mask";
export const WALLPAPER_MASK_COLOR = "Color";
export const WALLPAPER_MASK_SLIDER_ARIA =
  "Wallpaper mask level for readability";
export const WALLPAPER_MASK_DEFAULT_HINT =
  "Choose a wallpaper other than Default to adjust the overlay.";
export const WALLPAPER_MASK_READABILITY_HINT =
  "Increase if text or UI is hard to read over the wallpaper.";
export const WALLPAPER_UPLOAD_PROCESSING = "Processing...";
export const WALLPAPER_IMPORT_FROM_URL = "Import from link";
export const WALLPAPER_IMPORT_URL_HINT =
  "Paste a direct link to a publicly accessible image file (JPG, PNG, WebP).";
export const WALLPAPER_IMPORT_ACTION = "Import";

export function formatWallpaperUploadLabel(count: number): string {
  return `Upload custom wallpaper (${count}/${MAX_CUSTOM_WALLPAPERS})`;
}

export function formatCustomWallpaperLabel(slot: number): string {
  return `Custom ${slot + 1}`;
}

export function formatRemoveWallpaperLabel(label: string): string {
  return `Remove ${label}`;
}

export function formatWallpaperAriaLabel(label: string): string {
  return `Wallpaper ${label}`;
}

export function formatWallpaperMaskColorAria(label: string): string {
  return `Mask ${label}`;
}

export const WALLPAPER_SLOTS_FULL =
  "Custom wallpaper slots are full. Remove one to upload a new image.";

export function formatMaxCustomWallpapers(max: number): string {
  return `Maximum ${max} custom wallpapers.`;
}

export const WALLPAPER_UPLOAD_FAILED = "Failed to upload wallpaper.";
export const WALLPAPER_IMPORT_FAILED = "Failed to import wallpaper from link.";
export const WALLPAPER_READ_IMAGE_FAILED = "Failed to read image.";
export const WALLPAPER_LOAD_URL_FAILED =
  "Failed to load image from link. Make sure the link is public (JPG/PNG/WebP).";
export const WALLPAPER_BROWSER_UNSUPPORTED =
  "This browser does not support image processing.";
export const WALLPAPER_PROCESS_FAILED = "Failed to process wallpaper.";
export const WALLPAPER_LINK_NOT_IMAGE = "Link must point to an image file.";
export const WALLPAPER_FORMAT_INVALID = "Format must be JPG, PNG, or WebP.";
export const WALLPAPER_LINK_EMPTY = "Link cannot be empty.";
export const WALLPAPER_LINK_INVALID = "Invalid link.";
export const WALLPAPER_LINK_PROTOCOL =
  "Link must start with http:// or https://";
export const WALLPAPER_DOWNLOAD_FAILED = "Failed to download image from link.";
export const WALLPAPER_FILE_SIZE_MAX = "Maximum file size is 8 MB.";
