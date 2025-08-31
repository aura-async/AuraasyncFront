export interface UserData {
  email: string;
  name: string;
  gender: 'male' | 'female' | '';
  location: string;
  skin_tone?: string;
  face_shape?: string | null;
  body_shape?: string | null;
  personality?: string | null;
  onboarding_completed: boolean;
}

export interface UserState {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Local storage keys
const USER_DATA_KEY = 'auraasync_user_data';
const ONBOARDING_COMPLETED_KEY = 'auraasync_onboarding_completed';

// Default user state
export const defaultUserState: UserState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

// User state management functions
export const getUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
};

export const setUserData = (userData: UserData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const updateUserData = (updates: Partial<UserData>): UserData | null => {
  const currentUser = getUserData();
  if (!currentUser) return null;
  
  const updatedUser = { ...currentUser, ...updates };
  setUserData(updatedUser);
  return updatedUser;
};

export const clearUserData = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

export const isOnboardingCompleted = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const userData = getUserData();
    return userData?.onboarding_completed || false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

export const markOnboardingCompleted = (): void => {
  const currentUser = getUserData();
  if (currentUser) {
    updateUserData({ onboarding_completed: true });
  }
};

// Flow control functions
export const shouldShowGuestUI = (): boolean => {
  const userData = getUserData();
  return !userData || !userData.onboarding_completed;
};

export const shouldShowOnboarding = (): boolean => {
  const userData = getUserData();
  return !!(userData && !userData.onboarding_completed);
};

export const shouldShowGenderHomepage = (): boolean => {
  const userData = getUserData();
  return !!(userData && userData.onboarding_completed && userData.gender);
};

export const getRedirectPath = (): string => {
  const userData = getUserData();
  
  if (!userData) {
    return '/'; // Guest UI
  }
  
  if (!userData.onboarding_completed) {
    return '/onboarding'; // Force onboarding
  }
  
  // Gender-specific homepage
  return userData.gender === 'male' ? '/male' : '/female';
};
