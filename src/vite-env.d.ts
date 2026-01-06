/// <reference types="vite/client" />

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: { credential: string; select_by: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
}

interface GoogleButtonConfig {
  type: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: GoogleOneTapConfig) => void;
        renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
        prompt: (callback?: (notification: PromptNotification) => void) => void;
        cancel: () => void;
        revoke: (hint: string, callback: () => void) => void;
        disableAutoSelect: () => void;
      };
    };
  };
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
