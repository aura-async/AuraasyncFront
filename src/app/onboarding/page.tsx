"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import axios from "axios";
import {
  setUserData,
  updateUserData,
  markOnboardingCompleted,
} from "../../lib/userState";
import FaceAnalysisWidget from "../../components/FaceAnalysisWidget";
import SkinToneAnalysisWidget from "../../components/SkinToneAnalysisWidget";
import BodyAnalysisWidget from "../../components/BodyAnalysisWidget";
import PersonalityAnalysisWidget from "../../components/PersonalityAnalysisWidget";
import { guessFemaleType, guessMaleType, inchesToCm, cmToInches } from "../../lib/bodyTypes";
import Image from "next/image";
import FacePhoto from "@/app/assets/onboarding/face.png";
import MobileFacePhoto from "@/app/assets/onboarding/faceMobile.png";
import BodyPhoto from "@/app/assets/onboarding/body.png";
import MobileBodyPhoto from "@/app/assets/onboarding/bodyMobile.png";
import PersonalityPhoto from "@/app/assets/onboarding/personality.png";
import MobilePersonalityPhoto from "@/app/assets/onboarding/personalityMobile.png";
import { Check } from "lucide-react";
import male from "@/app/assets/man-avatar.png";
import female from "@/app/assets/woman-outline.png";
import mobilecam from '@/app/assets/MobileCamera.png'

// Body Type Images - Using placeholder for now
const HourglassImage = "/placeholder.png";
const RectangleImage = "/placeholder.png";
const InvertedTriangleImage = "/placeholder.png";
const AppleImage = "/placeholder.png";
const PearImage = "/placeholder.png";
const MesomorphImage = "/placeholder.png";
const EctomorphImage = "/placeholder.png";
const TrapezoidImage = "/placeholder.png";
const EndomorphImage = "/placeholder.png";

// Onboarding steps
const STEPS = {
  LOGIN: "login",
  BASIC_INFO: "basic_info",
  SKIN_FACE_ANALYSIS: "skin_face_analysis",
  BODY_ANALYSIS: "body_analysis",
  PERSONALITY_ANALYSIS: "personality_analysis",
  COMPLETE: "complete",
} as const;

type StepType = (typeof STEPS)[keyof typeof STEPS];
const STEP_ORDER: StepType[] = [
  STEPS.SKIN_FACE_ANALYSIS,
  STEPS.BODY_ANALYSIS,
  STEPS.PERSONALITY_ANALYSIS,
];

interface UserData {
  email: string;
  name: string;
  gender: "male" | "female" | "";
  location: string;
  skin_tone: string;
  face_shape: string | null;
  body_shape: string | null;
  personality: string | null;
  onboarding_completed: boolean;
}

interface Product {
  title: string;
  price: string;
  image: string;
  link: string;
}

const STEP_LABELS: Record<StepType, string> = {
  [STEPS.LOGIN]: "Login",
  [STEPS.BASIC_INFO]: "Basic Info",
  [STEPS.SKIN_FACE_ANALYSIS]: "Face structure",
  [STEPS.BODY_ANALYSIS]: "Body Type",
  [STEPS.PERSONALITY_ANALYSIS]: "Personality",
  [STEPS.COMPLETE]: "Complete",
};

export default function Onboarding() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const singleMode = searchParams?.get('mode') === 'single';
  const singleTarget = (searchParams?.get('target') as 'skin' | 'face' | 'body' | 'personality' | null) || null;
  const [currentStep, setCurrentStep] = useState<StepType>(STEPS.LOGIN);
  const [userData, setUserDataState] = useState<UserData>({
    email: "",
    name: "",
    gender: "",
    location: "",
    skin_tone: "",
    face_shape: null,
    body_shape: null,
    personality: null,
    onboarding_completed: false,
  });

  // When in single mode, set initial step based on target (skip login/basic)
  React.useEffect(() => {
    if (!singleMode) return;
    if (singleTarget === 'skin' || singleTarget === 'face') {
      setCurrentStep(STEPS.SKIN_FACE_ANALYSIS);
    } else if (singleTarget === 'body') {
      setCurrentStep(STEPS.BODY_ANALYSIS);
    } else if (singleTarget === 'personality') {
      setCurrentStep(STEPS.PERSONALITY_ANALYSIS);
    }
  }, [singleMode, singleTarget]);

  // Helpers for single-mode save from within step UIs
  const saveSingleModeAndReturn = async (updates: Partial<UserData>) => {
    if (!singleMode || !singleTarget) return false;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.replace('/login');
        return true;
      }
      const idToken = await currentUser.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const existing = userData;
      const body = {
        name: existing.name,
        gender: existing.gender,
        location: existing.location || 'Mumbai',
        skin_tone: updates.skin_tone ?? existing.skin_tone ?? null,
        face_shape: updates.face_shape ?? existing.face_shape ?? null,
        body_shape: updates.body_shape ?? existing.body_shape ?? null,
        personality: updates.personality ?? existing.personality ?? null,
      };
      await axios.put(`${API_URL}/auth/update-onboarding`, body, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      setUserData({ ...existing, ...updates });
    } catch (err) {
      console.error('Single-mode save failed', err);
    } finally {
      router.replace('/dashboard');
    }
    return true;
  };

  // Step 1: Login Component
  const LoginStep = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const handleGoogleLogin = async () => {
      try {
        setIsLoading(true);
        const result = await signInWithPopup(auth, googleProvider);

        if (result.user) {
          // Get the Firebase ID token
          const idToken = await result.user.getIdToken();

          // Call backend API to verify token and create/update user
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

          try {
            const response = await axios.post(
              `${API_URL}/auth/verify-user`,
              {
                email: result.user.email,
                name: result.user.displayName,
                profile_picture: result.user.photoURL,
                firebase_id: result.user.uid
              },
              {
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            const backendUserData = response.data;

            // Create user data for frontend state
            const userData: UserData = {
              email: backendUserData.email || result.user.email || "",
              name: backendUserData.name || result.user.displayName || "",
              gender: backendUserData.gender || "",
              location: backendUserData.location || "Mumbai", // Default location
              skin_tone: backendUserData.skin_tone || "",
              face_shape: backendUserData.face_shape || null,
              body_shape: backendUserData.body_shape || null,
              personality: backendUserData.personality || null,
              onboarding_completed: backendUserData.onboarding_completed || false,
            };

            setUserData(userData);
            setUserDataState(userData);

            // If user is new, proceed to onboarding
            if (!backendUserData.onboarding_completed) {
              setCurrentStep(STEPS.BASIC_INFO);
            } else {
              // If user exists but onboarding is not completed
              router.push(backendUserData.gender == "male" ? "/male" : "/female");
            }

            console.log("User authenticated and verified:", backendUserData);

          } catch (apiError: any) {
            console.error("Backend API error:", apiError);
            if (apiError.response?.status === 401) {
              alert("Authentication failed. Please try again.");
            } else {
              alert("Failed to verify user with backend. Please try again.");
            }
            // Sign out the user if backend verification fails
            await signOut(auth);
          }
        }
      } catch (error: any) {
        console.error("Google login error:", error);
        if (error.code === 'auth/popup-closed-by-user') {
          alert("Sign-in was cancelled. Please try again.");
        } else {
          alert("Failed to sign in with Google. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes
    React.useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);

        // If user is already authenticated, verify with backend
        if (user) {
          try {
            const idToken = await user.getIdToken();
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

            const response = await axios.post(
              `${API_URL}/auth/verify-user`,
              {
                email: user.email,
                name: user.displayName,
                profile_picture: user.photoURL,
                firebase_id: user.uid
              },
              {
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            const backendUserData = response.data;

            // Create user data for frontend state
            const userData: UserData = {
              email: backendUserData.email || user.email || "",
              name: backendUserData.name || user.displayName || "",
              gender: backendUserData.gender || "",
              location: backendUserData.location || "Mumbai",
              skin_tone: backendUserData.skin_tone || "",
              face_shape: backendUserData.face_shape || null,
              body_shape: backendUserData.body_shape || null,
              personality: backendUserData.personality || null,
              onboarding_completed: backendUserData.onboarding_completed || false,
            };

            setUserData(userData);
            setUserDataState(userData);

            // If user exists but onboarding is not completed, continue from where they left off
            if (!backendUserData.is_new_user) {
              setCurrentStep(STEPS.BASIC_INFO);
            }

          } catch (error) {
            console.error("Failed to verify user with backend:", error);
            // If backend verification fails, sign out the user
            await signOut(auth);
          }
        }
      });

      return () => unsubscribe();
    }, [router]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black"
      >
        <div className="text-center text-white p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Auraasync
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Let&apos;s personalize your fashion journey
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center mx-auto gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {!user && (
            <div className="mt-8">
              <button
                onClick={() => {
                  // For testing - skip to next step
                  const mockUserData: UserData = {
                    email: "test@gmail.com",
                    name: "",
                    gender: "",
                    location: "Mumbai",
                    skin_tone: "",
                    face_shape: null,
                    body_shape: null,
                    personality: null,
                    onboarding_completed: false,
                  };
                  setUserData(mockUserData);
                  setUserDataState(mockUserData);
                  setCurrentStep(STEPS.BASIC_INFO);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Skip for testing →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const ProgressBar = ({ currentStep }: { currentStep: StepType }) => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    return (
      <>
        {/* Desktop Progress Bar */}
        <div className="hidden md:flex sticky top-0 items-center justify-between w-full max-w-4xl mx-auto pt-6 z-40 px-4">
          {STEP_ORDER.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={step}
                className="flex flex-col items-center flex-1 relative"
              >
                {/* Step Circle */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold z-10
                  ${isActive
                      ? "bg-green-500 text-white"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-900 text-white"
                    }
                `}
                >
                  {isCompleted ? <Check size={16} /> : index + 1}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-sm text-gray-200">
                  {STEP_LABELS[step]}
                </div>

                {/* Connector Line */}
                {index !== STEP_ORDER.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-[4px] bg-gray-700 -z-10">
                    <div
                      className="h-[4px] bg-green-500 transition-all duration-500"
                      style={{ width: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Progress Bar - Fixed positioning */}
        <div className="md:hidden flex items-center justify-between w-full px-4 py-2 z-40 sticky top-0 left-0 right-0 bg-transparent">
          {STEP_ORDER.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={step}
                className="flex flex-col items-center flex-1 relative"
              >
                {/* Step Circle */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-2 z-10
                  ${isActive
                      ? "bg-green-500 text-white"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-900 text-white"
                    }
                `}
                >
                  {isCompleted ? <Check size={8} /> : index + 1}
                </div>

                {/* Step Label */}
                <div className="text-xs text-gray-200 text-center max-w-[90px]">
                  {STEP_LABELS[step]}
                </div>

                {/* Connector Line */}
                {index !== STEP_ORDER.length - 1 && (
                  <div className="absolute top-3 left-1/2 w-full h-[3px] bg-gray-700 -z-10">
                    <div
                      className="h-[3px] bg-green-500 transition-all duration-500"
                      style={{ width: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };
  // Step 2: Basic Info Component
  const BasicInfoStep = ({
    userData,
    updateUserData,
    setUserDataState,
    setCurrentStep,
    STEPS,
  }: any) => {
    const [localName, setLocalName] = useState(userData.name || "");
    const [localGender, setLocalGender] = useState(userData.gender || "");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (localName && localGender) {
        const updatedData = {
          ...userData,
          name: localName,
          gender: localGender,
        };

        // Update local state only
        updateUserData(updatedData);
        setUserDataState(updatedData);

        // Update localStorage with the new data
        localStorage.setItem('aurasync_user_data', JSON.stringify(updatedData));

        setCurrentStep(STEPS.SKIN_FACE_ANALYSIS);
      }
    };

    return (
      <>
        {/* Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen bg-[#251F1E] hidden md:flex items-center justify-center"
        >
          {/* Background Galaxy */}
          <div
            style={{ width: "100%", height: "100vh", position: "relative" }}
          ></div>

          {/* Form */}
          <div className="bg-[#353333] absolute backdrop-blur-lg rounded-2xl p-8 w-full max-w-md text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Tell us about yourself
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  What is your full name
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full px-4 py-3 rounded-tr-3xl rounded-bl-3xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:border-white/50"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setLocalGender("male")}
                    className={`p-4 rounded-lg border-2 transition-colors ${localGender === "male"
                      ? "border-blue-400 bg-blue-400/20"
                      : "border-white/30 bg-white/10 hover:border-white/50"
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2 flex items-center justify-center">
                        <Image src={male} height={100} width={100} alt="male" />
                      </div>
                      <div className="font-medium">Male</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalGender("female")}
                    className={`p-4 rounded-lg border-2 transition-colors ${localGender === "female"
                      ? "border-pink-400 bg-pink-400/20"
                      : "border-white/30 bg-white/10 hover:border-white/50"
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2 flex items-center justify-center">
                        <Image
                          src={female}
                          height={100}
                          width={100}
                          alt="female"
                        />
                      </div>
                      <div className="font-medium">Female</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!localName || !localGender}
                className="w-full rounded-full bg-[#4F4D4D] py-3 transition-all"
              >
                Proceed
              </button>
            </form>
          </div>
        </motion.div>

        {/* Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen bg-[#251F1E] md:hidden flex items-center justify-center"
        >
          {/* Form */}
          <div className="bg-[#353333] absolute backdrop-blur-lg rounded-2xl p-6 w-full max-w-sm text-white mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Tell us about yourself
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  What is your full name
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full px-4 py-3 rounded-tr-3xl rounded-bl-3xl bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:border-white/50"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setLocalGender("male")}
                    className={`p-3 rounded-lg border-2 transition-colors ${localGender === "male"
                      ? "border-blue-400 bg-blue-400/20"
                      : "border-white/30 bg-white/10 hover:border-white/50"
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-2 flex items-center justify-center">
                        <Image src={male} height={80} width={80} alt="male" />
                      </div>
                      <div className="font-medium text-sm">Male</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalGender("female")}
                    className={`p-3 rounded-lg border-2 transition-colors ${localGender === "female"
                      ? "border-pink-400 bg-pink-400/20"
                      : "border-white/30 bg-white/10 hover:border-white/50"
                      }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-2 flex items-center justify-center">
                        <Image
                          src={female}
                          height={80}
                          width={80}
                          alt="female"
                        />
                      </div>
                      <div className="font-medium text-sm">Female</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!localName || !localGender}
                className="w-full rounded-full bg-[#4F4D4D] py-3 transition-all"
              >
                Proceed
              </button>
            </form>
          </div>
        </motion.div>
      </>
    );
  };

  // Step 3: Skin & Face Analysis Component
  const SkinFaceAnalysisStep = ({
    userData,
    setUserDataState,
    setCurrentStep,
    STEPS,
  }: any) => {
    const [analysisData, setAnalysisData] = useState({
      skin_tone: "",
      face_shape: "",
    });

    const [currentAnalysis, setCurrentAnalysis] = useState<
      "skin_tone" | "face_shape" | null
    >(null);
    const [progress, setProgress] = useState(0);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [analysisResults, setAnalysisResults] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [faceLocked, setFaceLocked] = useState(false);
    const [showFaceInstructions, setShowFaceInstructions] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Mobile-only preloader before starting camera capture
    const [isMobilePreloading, setIsMobilePreloading] = useState(false);

    const handleNext = () => {
      if (analysisData.skin_tone) {
        const updatedData = { ...userData, ...analysisData };
        updateUserData(updatedData);
        setUserDataState(updatedData);

        // Update localStorage with the new data
        localStorage.setItem('aurasync_user_data', JSON.stringify(updatedData));

        setCurrentStep(STEPS.BODY_ANALYSIS);
      }
    };

    const startAnalysis = async (
      type: "skin_tone" | "face_shape",
      method: "camera" | "upload" = "camera"
    ) => {
      if (type === "face_shape" && faceLocked) return;
      setCurrentAnalysis(type);
      setProgress(0);
      setCapturedImages([]);
      setAnalysisResults([]);
      setIsAnalyzing(false);
      setShowManualInput(false);
      setUploadedImage(null);

      if (method === "upload") {
        setShowUpload(true);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Trigger file input
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      } else {
        setShowCamera(true);
        setIsAutoCapturing(true);
        setShowUpload(false);
        // Start automatic capture process
        startAutoCapture();
      }
    };

    // Triggered only from Mobile UI: show 3s preloader, then start camera capture
    const handleMobileCaptureClick = async () => {
      // Determine which analysis to run based on current singleMode/target
      const targetType = singleMode && singleTarget === 'skin' ? "skin_tone" : "face_shape";
      setIsMobilePreloading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsMobilePreloading(false);
      startAnalysis(targetType as "skin_tone" | "face_shape", "camera");
    };

    const startAutoCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Start automatic capture sequence
        for (let i = 0; i < 3; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          await captureImage();
          setProgress((i + 1) * 25);
        }

        // Stop camera after capturing
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setShowCamera(false);
        setIsAutoCapturing(false);
      } catch (err) {
        console.error("Camera access error:", err);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Fallback to manual input
        handleManualInput(currentAnalysis!);
      }
    };

    const captureImage = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              setCapturedImages((prev) => [...prev, imageUrl]);

              // Analyze the captured image
              await analyzeImage(blob);
            }
          }, "image/jpeg");
        }
      }
    };

    const analyzeImage = async (blob: Blob) => {
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append(
          "file",
          new File([blob], "captured.jpg", { type: "image/jpeg" })
        );

        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const endpoint =
          currentAnalysis === "skin_tone"
            ? `${API}/analyze/skin-tone`
            : `${API}/analyze/face`;

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const data = await response.json();
        let result = "";

        if (currentAnalysis === "skin_tone") {
          result = data.skin_tone || "Unknown";
        } else {
          result = data.face_shape || "Unknown";
        }

        setAnalysisResults((prev) => [...prev, result]);

        // If we have 3 results, determine final result
        if (analysisResults.length + 1 >= 3) {
          const finalResults = [...analysisResults, result];
          const mostCommon = finalResults.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const finalResult = Object.entries(mostCommon).reduce((a, b) =>
            mostCommon[a[0]] > mostCommon[b[0]] ? a : b
          )[0];

          setAnalysisData((prev) => ({
            ...prev,
            [currentAnalysis!]: finalResult,
          }));
          setCurrentAnalysis(null);
          setProgress(100);
        }
      } catch (error) {
        console.error("Analysis error:", error);
        // Add a default result if analysis fails
        const defaultResult = currentAnalysis === "skin_tone" ? "Warm" : "Oval";
        setAnalysisResults((prev) => [...prev, defaultResult]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualInput = (type: "skin_tone" | "face_shape") => {
      setCurrentAnalysis(type);
      setShowManualInput(true);
      setShowCamera(false);
      setIsAutoCapturing(false);
      setShowUpload(false);
      if (type === "skin_tone") {
        setFaceLocked(true);
        setAnalysisData((prev) => ({ ...prev, face_shape: "" }));
      }
    };

    const handleFileUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Create preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setProgress(50);

      // Analyze the uploaded image
      try {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append("file", file);

        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const endpoint =
          currentAnalysis === "skin_tone"
            ? `${API}/analyze/skin-tone`
            : `${API}/analyze/face`;

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const data = await response.json();
        let result = "";

        if (currentAnalysis === "skin_tone") {
          result = data.skin_tone || "Unknown";
        } else {
          result = data.face_shape || "Unknown";
        }

        setAnalysisResults([result]);
        setAnalysisData((prev) => ({ ...prev, [currentAnalysis!]: result }));
        setCurrentAnalysis(null);
        setProgress(100);
        setShowUpload(false);
      } catch (error) {
        console.error("Analysis error:", error);
        alert("Analysis failed. Please try again or use manual selection.");
        setShowUpload(false);
        setCurrentAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualSelection = (value: string) => {
      setAnalysisData((prev) => ({ ...prev, [currentAnalysis!]: value }));
      setCurrentAnalysis(null);
      setShowManualInput(false);
    };

    // Upload Analysis Component
    const UploadAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          {currentAnalysis === "skin_tone"
            ? "Skin Tone Analysis"
            : "Face Shape Analysis"}
          <span className="ml-2 text-sm px-2 py-1 rounded bg-green-500/20 text-green-300">
            Upload Analysis
          </span>
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {isAnalyzing ? "Analyzing..." : "Ready"}
        </p>

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing uploaded image...</p>
          </div>
        )}

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="mb-6 flex flex-col items-center">
            <img
              src={uploadedImage}
              alt="Uploaded image"
              className="w-full max-w-md rounded-lg border-2 border-gray-700 mb-2 shadow-lg"
            />
            <p className="text-sm text-gray-300">Uploaded image preview</p>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Result:</h4>
            <div className="bg-green-500/20 rounded-lg p-3">
              <p className="text-green-300 font-medium">
                {currentAnalysis === "skin_tone" ? "Skin Tone" : "Face Shape"}:{" "}
                {analysisResults[0]}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput(currentAnalysis ?? "skin_tone")}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    const SkinToneManualInput = () => {
      const [currentQuestion, setCurrentQuestion] = useState(0);
      const [answers, setAnswers] = useState<string[]>([]);

      const questions = [
        {
          question: "What color are the veins on your wrist?",
          options: [
            "Greenish",
            "Bluish or Purple",
            "Hard to tell / Mix of both",
          ],
          values: ["WARM", "COLD", "NEUTRAL"],
        },
        {
          question: "How does your skin react to sunlight?",
          options: [
            "Tans easily, rarely burns",
            "Burns or turns pink easily",
            "Sometimes tans, sometimes burns",
          ],
          values: ["WARM", "COLD", "NEUTRAL"],
        },
        {
          question: "What undertone does your bare skin have in natural light?",
          options: [
            "Yellow, peachy, or golden",
            "Pink, red, or bluish",
            "Olive or hard to tell",
          ],
          values: ["WARM", "COLD", "NEUTRAL"],
        },
      ];

      const determineSkinTone = (answers: string[]) => {
        // Count occurrences of each type
        const warmCount = answers.filter((answer) => answer === "WARM").length;
        const coldCount = answers.filter((answer) => answer === "COLD").length;
        const neutralCount = answers.filter(
          (answer) => answer === "NEUTRAL"
        ).length;

        // If 2 or more of the same answers are selected, that's the result
        if (warmCount >= 2) return "Warm";
        if (coldCount >= 2) return "Cold";
        if (neutralCount >= 2) return "Neutral";

        // If all three show different values, result is Neutral
        if (warmCount === 1 && coldCount === 1 && neutralCount === 1)
          return "Neutral";

        // Default fallback
        return "Neutral";
      };

      const handleAnswer = (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          // Determine skin tone based on the logic you specified
          const skinTone = determineSkinTone(newAnswers);

          setAnalysisData((prev) => ({ ...prev, skin_tone: skinTone }));
          setCurrentAnalysis(null);
          setShowManualInput(false);
        }
      };

      const resetQuestionnaire = () => {
        setCurrentQuestion(0);
        setAnswers([]);
      };

      return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Skin Tone Analysis</h3>

          {currentQuestion < questions.length ? (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <div className="flex space-x-1">
                    {questions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${index <= currentQuestion ? "bg-white" : "bg-white/30"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100
                        }%`,
                    }}
                  />
                </div>
              </div>

              <h4 className="text-lg font-medium mb-6">
                {questions[currentQuestion].question}
              </h4>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleAnswer(questions[currentQuestion].values[index])
                    }
                    className="w-full p-4 rounded-lg border-2 border-white/30 bg-white/10 hover:border-white/50 transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span>{option}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${questions[currentQuestion].values[index] === "WARM"
                          ? "bg-orange-500/20 text-orange-300"
                          : questions[currentQuestion].values[index] ===
                            "COLD"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-gray-500/20 text-gray-300"
                          }`}
                      >
                        {questions[currentQuestion].values[index]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <button
                  onClick={() => {
                    setCurrentQuestion(currentQuestion - 1);
                    setAnswers(answers.slice(0, -1));
                  }}
                  className="mt-4 w-full text-gray-300 underline text-sm"
                >
                  ← Back to previous question
                </button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h4 className="text-lg font-medium mb-2">Analysis Complete!</h4>
              <p className="text-gray-300 mb-4">
                Your skin tone has been determined based on your answers.
              </p>

              {/* Show answers summary */}
              <div className="bg-white/10 rounded-lg p-4 mb-4 text-left">
                <h5 className="font-semibold mb-2">Your Answers:</h5>
                {questions.map((q, index) => (
                  <div key={index} className="text-sm mb-2">
                    <span className="text-gray-300">Q{index + 1}:</span>{" "}
                    {q.question}
                    <br />
                    <span className="text-gray-300">Answer:</span>{" "}
                    {q.options[q.values.indexOf(answers[index])]}
                    <span
                      className={`ml-2 text-xs px-2 py-1 rounded ${answers[index] === "WARM"
                        ? "bg-orange-500/20 text-orange-300"
                        : answers[index] === "COLD"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-gray-500/20 text-gray-300"
                        }`}
                    >
                      {answers[index]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-green-500/20 rounded-lg p-4 mb-4">
                <p className="text-green-300 font-medium">
                  Final Result: {analysisData.skin_tone}
                </p>
              </div>
              <button
                onClick={resetQuestionnaire}
                className="text-gray-300 underline text-sm"
              >
                Retake questionnaire
              </button>
            </div>
          )}
        </div>
      );
    };

    const FaceShapeManualInput = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Select Your Face Shape</h3>
        <div className="space-y-3">
          {["Oval", "Round", "Square", "Heart", "Diamond", "Rectangle"].map(
            (shape) => (
              <button
                key={shape}
                onClick={() => handleManualSelection(shape)}
                className="w-full p-3 rounded-lg border-2 border-white/30 bg-white/10 hover:border-white/50 transition-colors"
              >
                {shape}
              </button>
            )
          )}
        </div>
      </div>
    );

    // Camera Analysis Component
    const CameraAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          {currentAnalysis === "skin_tone"
            ? "Skin Tone Analysis"
            : "Face Shape Analysis"}
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {capturedImages.length}/3 images captured
        </p>

        {isAutoCapturing && (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              Auto-capturing in progress...
            </div>
            <p className="text-sm text-gray-300">
              Please stay still while we capture 3 images
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing image...</p>
          </div>
        )}

        {/* Camera Feed */}
        {showCamera && (
          <div className="mb-6 flex flex-col items-center">
            <video
              ref={videoRef}
              className="w-full h-[70vh] md:max-w-md md:h-auto rounded-lg border-2 border-gray-700 mb-2 shadow-lg object-cover"
              autoPlay
              playsInline
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}

        {capturedImages.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Captured Images:</h4>
            <div className="grid grid-cols-3 gap-2">
              {capturedImages.map((img, index) => (
                <div
                  key={index}
                  className="bg-white/20 rounded p-2 text-center text-sm"
                >
                  <img
                    src={img}
                    alt={`Image ${index + 1}`}
                    className="w-full h-20 object-cover rounded mb-1"
                  />
                  Image {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Results:</h4>
            <div className="space-y-1">
              {analysisResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-300">
                  Image {index + 1}: {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput(currentAnalysis!)}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    return (
      <>
        {/**desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen hidden md:flex bg-[#251F1E] items-center justify-center text-white p-4 md:p-8"
        >
          <div className=" mx-auto flex flex-col items-center w-full">
            {/* Progress */}
            <div className="w-full mb-6">
              <ProgressBar currentStep={STEPS.SKIN_FACE_ANALYSIS} />
            </div>

            <div className="w-full flex flex-col md:flex-row gap-6 items-stretch">
              {/* LEFT PANEL: IMAGE / CAMERA / UPLOAD */}
              <div className="md:w-[65%] w-full flex items-center justify-center relative rounded-lg overflow-hidden min-h-[60vh] md:min-h-[80vh]">
                {showUpload && uploadedImage ? (
                  <Image
                    src={uploadedImage}
                    alt="Uploaded face"
                    fill
                    className=" object-fit lg:object-contain"
                  />
                ) : showManualInput && currentAnalysis === "skin_tone" ? (
                  <SkinToneManualInput />
                ) : showManualInput && currentAnalysis === "face_shape" ? (
                  <FaceShapeManualInput />
                ) : currentAnalysis === "face_shape" && !showManualInput && !showUpload ? (
                  <CameraAnalysis />
                ) : (
                  <Image
                    src={FacePhoto}
                    alt="Placeholder Face"
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {/* RIGHT PANEL: CONTROLS */}
              <div className="md:w-[35%] w-full flex flex-col space-y-6">
                {/* Instructions */}
                <div className="w-full h-auto bg-[#444141] p-4 rounded-3xl backdrop-blur-lg text-white">
                  <h3 className="text-lg font-bold mb-3">
                    Analysis Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Skin Tone:</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${analysisData.skin_tone
                          ? "bg-green-500/20 text-green-300"
                          : "bg-gray-500/20 text-gray-300"
                          }`}
                      >
                        {analysisData.skin_tone || "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Face Shape:</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${analysisData.face_shape
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                          }`}
                      >
                        {analysisData.face_shape || "Optional"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-[#444141] p-3 px-6 rounded-3xl text-white">


                  <h1 className="text-xl font-bold mb-4">
                    Face & Skin Analysis Instructions
                  </h1>
                  <ul className="list-disc list-inside text-sm space-y-2 mb-3">
                    <li>Sit in a well-lit area (avoid shadows or backlight).</li>
                    <li>Keep your head straight and look directly into the camera.</li>
                    <li>Remove glasses, masks, or anything covering your face.</li>
                    <li>Stay still for a few seconds while we scan.</li>
                  </ul>
                  <p className="text-sm">
                    ✨ <span className="font-semibold">Tip:</span> Natural daylight
                    works best for accurate skin tone detection.
                  </p>
                </div>

                {/* Upload/Capture Section - switches to Skin when target=skin */}
                {singleMode ? (
                  singleTarget === 'skin' ? (
                    <>
                      <div className="flex flex-col items-center bg-[#444141]  rounded-3xl text-center">
                        <h1 className="text-lg font-bold mb-3">Upload picture from your device</h1>
                        <button
                          onClick={() => startAnalysis("skin_tone", "upload")}
                          className="border-2 border-white px-6 py-2 text-white rounded-full font-semibold hover:border-white/70 transition-all"
                        >
                          Upload +
                        </button>
                      </div>
                      <button
                        onClick={() => startAnalysis("skin_tone", "camera")}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555] transition-all"
                      >
                        Capture from Web Camera
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center bg-[#444141] p-4 rounded-3xl text-center">
                        <h1 className="text-lg font-bold mb-3">Upload picture from your device</h1>
                        <button
                          onClick={() => startAnalysis("face_shape", "upload")}
                          className="border-2 border-white px-6 py-2 text-white rounded-full font-semibold hover:border-white/70 transition-all"
                        >
                          Upload +
                        </button>
                      </div>
                      <button
                        onClick={() => startAnalysis("face_shape", "camera")}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555] transition-all"
                      >
                        Capture from Web Camera
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <div className="flex flex-col items-center bg-[#444141] p-4 rounded-3xl text-center">
                      <h1 className="text-lg font-bold mb-3">Upload picture from your device</h1>
                      <button
                        onClick={() => startAnalysis("face_shape", "upload")}
                        className="border-2 border-white px-6 py-2 text-white rounded-full font-semibold hover:border-white/70 transition-all"
                      >
                        Upload +
                      </button>
                    </div>
                    <button
                      onClick={() => startAnalysis("face_shape", "camera")}
                      className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555] transition-all"
                    >
                      Capture from Web Camera
                    </button>
                  </>
                )}

                {/* Manual Input */}
                <div className="flex  items-center gap-8 justify-between">
                  {!(singleMode && singleTarget === 'face') && (
                    <button
                      onClick={() => handleManualInput("skin_tone")}
                      className=" text-white w-full py-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      <span className="underline"> Insert Skin Tone Manually</span>
                    </button>
                  )}
                  {!(singleMode && singleTarget === 'skin') && (
                    <button
                      onClick={() => handleManualInput("face_shape")}
                      className="w-full text-white py-1 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <span className="underline"> Insert Face Shape Manually</span>
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-4 mt-6">
                  {!singleMode && (
                    <button
                      onClick={() => setCurrentStep(STEPS.BASIC_INFO)}
                      className="w-1/2 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (singleMode && singleTarget === 'skin') {
                        saveSingleModeAndReturn({ skin_tone: analysisData.skin_tone });
                      } else if (singleMode && singleTarget === 'face') {
                        saveSingleModeAndReturn({ face_shape: analysisData.face_shape || null });
                      } else {
                        handleNext();
                      }
                    }}
                    disabled={singleMode ? (singleTarget === 'skin' ? !analysisData.skin_tone : !analysisData.face_shape) : !analysisData.skin_tone}
                    className="w-1/2 py-3 rounded-lg bg-[#444141] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#555] transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </motion.div>

        {/* Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen md:hidden bg-[#251F1E] flex items-center justify-center text-white p-4 md:p-8"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full">
              <ProgressBar currentStep={STEPS.SKIN_FACE_ANALYSIS} />
            </div>

            {/* Show upload analysis if active */}
            {showUpload && currentAnalysis && (
              <div className="mb-8">
                <UploadAnalysis />
              </div>
            )}

            {/* Show camera analysis if active */}
            {currentAnalysis &&
              !showManualInput &&
              !showUpload && (
                <div className="mb-8">
                  <CameraAnalysis />
                </div>
              )}

            {/* Show manual input if active */}
            {showManualInput && currentAnalysis === "skin_tone" && (
              <SkinToneManualInput />
            )}
            {showManualInput && currentAnalysis === "face_shape" && (
              <FaceShapeManualInput />
            )}

            {/* Show analysis options if no analysis is active */}
            {!currentAnalysis && !showManualInput && (
              <div className="w-full md:w-[100vw] md:h-[80vh] gap-8">
                {/* Face Analysis */}
                <div className="backdrop-blur-lg rounded-xl p-6 mt-20">
                  <div className="flex flex-col gap-6 items-start">
                    {/* Image Section - Now on Top */}
                    <div className="w-full flex items-center justify-center relative overflow-hidden">
                      <Image
                        src={MobileFacePhoto}
                        alt="Face Photo"
                        height={200}
                        width={200}
                        className="object-cover w-[300px] h-[300px] rounded-full"
                      />
                    </div>

                    {/* Content Section - Now Below */}
                    <div className="w-full flex flex-col space-y-4">
                      <button
                        onClick={() => setShowFaceInstructions(true)}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555555] transition-all"
                      >
                        Instructions
                      </button>
                      {/* Analysis Status */}
                      <div className="w-full h-auto bg-[#444141] p-4 rounded-3xl backdrop-blur-lg text-white">
                        <h3 className="text-lg font-bold mb-3">
                          Analysis Status
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Skin Tone:</span>
                            <span
                              className={`text-sm px-2 py-1 rounded ${analysisData.skin_tone
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-500/20 text-gray-300"
                                }`}
                            >
                              {analysisData.skin_tone || "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Face Shape:</span>
                            <span
                              className={`text-sm px-2 py-1 rounded ${analysisData.face_shape
                                ? "bg-green-500/20 text-green-300"
                                : "bg-yellow-500/20 text-yellow-300"
                                }`}
                            >
                              {analysisData.face_shape || "Optional"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex bg-[#444141] p-6 rounded-3xl justify-center items-center flex-col">
                        <h1 className="text-xl font-bold mb-4 text-center">
                          Upload picture from your device{" "}
                        </h1>
                        <button
                          onClick={() => startAnalysis(singleMode && singleTarget === 'skin' ? "skin_tone" : "face_shape", "upload")}
                          className="border-2 border-white px-16 text-white py-3 rounded-full font-semibold hover:border-white hover:from-green-600 hover:to-emerald-700 transition-all"
                        >
                          Upload +
                        </button>
                      </div>
                      <button
                        onClick={handleMobileCaptureClick}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                      >
                        Capture from Web Camera
                      </button>
                      <div className=" justify-between  ">
                        {!(singleMode && singleTarget === 'face') && (
                          <button
                            onClick={() => handleManualInput("skin_tone")}
                            className=" text-white w-full py-3 rounded hover:bg-gray-700 transition-colors"
                          >
                            <span className="underline"> Insert Skin Tone Manually</span>
                          </button>
                        )}
                        {!(singleMode && singleTarget === 'skin') && (
                          <button
                            onClick={() => handleManualInput("face_shape")}
                            className="w-full text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <span className="underline"> Insert Face Shape Manually</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          // Skip face analysis, only do skin tone
                          if (!analysisData.skin_tone) {
                            setAnalysisData((prev) => ({
                              ...prev,
                              skin_tone: "Warm",
                            })); // Default skin tone
                          }
                        }}
                        className="w-full text-gray-400 py-2 text-sm underline hover:text-white transition-colors"
                      >
                        Skip Face Analysis
                      </button>
                      <div className="flex justify-center gap-4 mt-8">
                        <button
                          onClick={() => setCurrentStep(STEPS.BASIC_INFO)}
                          className="px-8 py-3 w-full rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => {
                            if (singleMode && singleTarget === 'skin') {
                              saveSingleModeAndReturn({ skin_tone: analysisData.skin_tone });
                            } else if (singleMode && singleTarget === 'face') {
                              saveSingleModeAndReturn({ face_shape: analysisData.face_shape || null });
                            } else {
                              handleNext();
                            }
                          }}
                          disabled={singleMode ? (singleTarget === 'skin' ? !analysisData.skin_tone : !analysisData.face_shape) : !analysisData.skin_tone}
                          className="px-8 py-3 w-full rounded-lg bg-[white]/10 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            {/* Mobile Preloader Overlay (2s before camera capture) */}
            {isMobilePreloading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center ">
              <motion.div
                initial={{ clipPath: "circle(0% at 50% 50%)" }}
                animate={{ clipPath: "circle(150% at 50% 50%)" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="fixed inset-0 z-50"
              >
                <Image
                  fill
                  alt="image"
                  src={mobilecam}
                  className="object-cover"
                />
              </motion.div>

            </div>


             )} 

            {/* Face Instructions Modal */}
            {showFaceInstructions && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#444141] rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      ✨ Face & Skin Analysis Instructions
                    </h3>
                    <button
                      onClick={() => setShowFaceInstructions(false)}
                      className="text-white hover:text-gray-300 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-white text-sm space-y-3">
                    <p>To get the best results, please follow these steps:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Sit in a well-lit area (avoid shadows or backlight).
                      </li>
                      <li>
                        Keep your head straight and look directly into the
                        camera.
                      </li>
                      <li>
                        Remove glasses, masks, or anything covering your face.
                      </li>
                      <li>Stay still for a few seconds while we scan.</li>
                    </ul>
                    <p className="mt-4">
                      ✨ <span className="font-semibold">Tip:</span> Natural
                      daylight works best for accurate skin tone detection.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </>
    );
  };

  // Step 4: Body Analysis Component
  const BodyAnalysisStep = ({
    userData,
    setUserDataState,
    setCurrentStep,
    STEPS,
  }: any) => {
    const [analysisData, setAnalysisData] = useState({
      body_shape: "",
    });

    const [currentAnalysis, setCurrentAnalysis] = useState<"body_shape" | null>(
      null
    );
    const [progress, setProgress] = useState(0);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [analysisResults, setAnalysisResults] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [showManualMeasurements, setShowManualMeasurements] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const [measurements, setMeasurements] = useState({
      bust: '',
      waist: '',
      hips: '',
      shoulders: '',
      chest: '',
      bicep: '',
      neck: '',
      calf: ''
    });
    const [unit, setUnit] = useState<'cm' | 'in'>('cm');

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [showBodyInstructions, setShowBodyInstructions] = useState(false);
    const [isMobilePreloadingBody, setIsMobilePreloadingBody] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleNext = () => {
      const updatedData = { ...userData, body_shape: analysisData.body_shape };
      updateUserData(updatedData);
      setUserDataState(updatedData);

      // Update localStorage with the new data
      localStorage.setItem('aurasync_user_data', JSON.stringify(updatedData));

      setCurrentStep(STEPS.PERSONALITY_ANALYSIS);
    };

    const startAnalysis = async (
      type: "body_shape",
      method: "camera" | "upload" = "camera"
    ) => {
      setCurrentAnalysis(type);
      setProgress(0);
      setCapturedImages([]);
      setAnalysisResults([]);
      setIsAnalyzing(false);
      setShowManualInput(false);
      setUploadedImage(null);

      if (method === "upload") {
        setShowUpload(true);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Trigger file input
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      } else {
        setShowCamera(true);
        setIsAutoCapturing(true);
        setShowUpload(false);
        // Start automatic capture process
        startAutoCapture();
      }
    };

    // Triggered only from Mobile UI for body: show 2s preloader, then start camera capture
    const handleMobileBodyCaptureClick = async () => {
      setIsMobilePreloadingBody(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsMobilePreloadingBody(false);
      startAnalysis("body_shape", "camera");
    };

    const startAutoCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        // Start automatic capture sequence
        for (let i = 0; i < 3; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          await captureImage();
          setProgress((i + 1) * 25);
        }

        // Stop camera after capturing
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setShowCamera(false);
        setIsAutoCapturing(false);
      } catch (err) {
        console.error("Camera access error:", err);
        setShowCamera(false);
        setIsAutoCapturing(false);
        // Fallback to manual input
        handleManualInput("body_shape");
      }
    };

    const captureImage = async () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              setCapturedImages((prev) => [...prev, imageUrl]);

              // Analyze the captured image
              await analyzeImage(blob);
            }
          }, "image/jpeg");
        }
      }
    };

    const analyzeImage = async (blob: Blob) => {
      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append(
          "file",
          new File([blob], "captured.jpg", { type: "image/jpeg" })
        );

        // Use basic body analysis endpoint
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const endpoint = `${API}/analyze/body`;

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const data = await response.json();
        const result = data.body_shape || "Unknown";

        // Log analysis details for debugging
        console.log("Body analysis result:", {
          body_shape: data.body_shape,
          confidence: data.confidence,
          analysis_type: data.analysis_type,
          probabilities: data.probabilities,
        });

        setAnalysisResults((prev) => [...prev, result]);

        // If we have 3 results, determine final result
        if (analysisResults.length + 1 >= 3) {
          const finalResults = [...analysisResults, result];
          const mostCommon = finalResults.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const finalResult = Object.entries(mostCommon).reduce((a, b) =>
            mostCommon[a[0]] > mostCommon[b[0]] ? a : b
          )[0];

          setAnalysisData((prev) => ({
            ...prev,
            [currentAnalysis!]: finalResult,
          }));
          setCurrentAnalysis(null);
          setProgress(100);
        }
      } catch (error) {
        console.error("Analysis error:", error);
        // Add a default result if analysis fails
        const defaultResult =
          userData.gender === "female" ? "Hourglass" : "Mesomorph";
        setAnalysisResults((prev) => [...prev, defaultResult]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualInput = (type: "body_shape") => {
      setCurrentAnalysis(type);
      setShowManualInput(true);
      setShowCamera(false);
      setIsAutoCapturing(false);
      setShowUpload(false);
    };

    const handleFileUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Create preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setProgress(50);

      // Analyze the uploaded image
      try {
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append("file", file);

        // Use basic body analysis endpoint
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const endpoint = `${API}/analyze/body`;

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Analysis failed");
        }

        const data = await response.json();
        const result = data.body_shape || "Unknown";

        // Log analysis details for debugging
        console.log("Body analysis result:", {
          body_shape: data.body_shape,
          confidence: data.confidence,
          analysis_type: data.analysis_type,
          probabilities: data.probabilities,
        });

        setAnalysisResults([result]);
        setAnalysisData((prev) => ({ ...prev, [currentAnalysis!]: result }));
        setCurrentAnalysis(null);
        setProgress(100);
        setShowUpload(false);
      } catch (error) {
        console.error("Analysis error:", error);
        alert("Analysis failed. Please try again or use manual selection.");
        setShowUpload(false);
        setCurrentAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleManualSelection = (value: string) => {
      setAnalysisData((prev) => ({ ...prev, [currentAnalysis!]: value }));
      setCurrentAnalysis(null);
      setShowManualInput(false);
    };

    const handleManualMeasurements = () => {
      setShowManualMeasurements(true);
      setShowManualInput(false);
      setShowCamera(false);
      setShowUpload(false);
    };

    const analyzeMeasurements = () => {
      // Convert measurements to numbers and cm if needed
      const measurementData: any = {};
      Object.keys(measurements).forEach(key => {
        const value = measurements[key as keyof typeof measurements];
        if (value && !isNaN(Number(value))) {
          let numValue = Number(value);
          if (unit === 'in') {
            numValue = inchesToCm(numValue);
          }
          measurementData[key] = numValue;
        }
      });

      // Analyze based on gender
      let results;
      if (userData.gender === 'female') {
        results = guessFemaleType(measurementData);
      } else {
        results = guessMaleType(measurementData);
      }

      if (results && results.length > 0) {
        const bestMatch = results[0];
        setAnalysisData((prev) => ({
          ...prev,
          body_shape: bestMatch.label
        }));
        setAnalysisResults([bestMatch.label]);
        setProgress(100);
      }

      setShowManualMeasurements(false);
      setCurrentAnalysis(null);
    };

    const updateMeasurement = (field: string, value: string) => {
      setMeasurements(prev => ({
        ...prev,
        [field]: value
      }));
    };

    // Upload Analysis Component
    const UploadAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Body Shape Analysis
          <span className="ml-2 text-sm px-2 py-1 rounded bg-blue-500/20 text-blue-300">
            Upload
          </span>
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {isAnalyzing ? "Analyzing..." : "Ready"}
        </p>

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing uploaded image...</p>
          </div>
        )}

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="mb-6 flex flex-col items-center">
            <img
              src={uploadedImage}
              alt="Uploaded image"
              className="w-full max-w-md rounded-lg border-2 border-gray-700 mb-2 shadow-lg"
            />
            <p className="text-sm text-gray-300">Uploaded image preview</p>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Result:</h4>
            <div className="bg-green-500/20 rounded-lg p-3">
              <p className="text-green-300 font-medium">
                Body Shape: {analysisResults[0]}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput("body_shape")}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    // Manual Measurements Component
    const ManualMeasurementsInput = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Manual Measurements
          <span className="ml-2 text-sm px-2 py-1 rounded bg-green-500/20 text-green-300">
            Measurements
          </span>
        </h3>

        <p className="text-sm text-gray-300 text-center mb-6">
          Enter your body measurements for accurate body type analysis
        </p>

        {/* Unit Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setUnit('cm')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${unit === 'cm'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white'
                }`}
            >
              Centimeters
            </button>
            <button
              onClick={() => setUnit('in')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${unit === 'in'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white'
                }`}
            >
              Inches
            </button>
          </div>
        </div>

        {/* Measurement Inputs */}
        <div className="space-y-4">
          {userData.gender === 'female' ? (
            // Female measurements
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bust ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.bust}
                    onChange={(e) => updateMeasurement('bust', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter bust measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Waist ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.waist}
                    onChange={(e) => updateMeasurement('waist', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter waist measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hips ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.hips}
                    onChange={(e) => updateMeasurement('hips', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter hips measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shoulders ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.shoulders}
                    onChange={(e) => updateMeasurement('shoulders', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter shoulders measurement"
                  />
                </div>
              </div>
            </>
          ) : (
            // Male measurements
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chest ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.chest}
                    onChange={(e) => updateMeasurement('chest', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter chest measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Waist ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.waist}
                    onChange={(e) => updateMeasurement('waist', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter waist measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shoulders ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.shoulders}
                    onChange={(e) => updateMeasurement('shoulders', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter shoulders measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bicep ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.bicep}
                    onChange={(e) => updateMeasurement('bicep', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter bicep measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Neck ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.neck}
                    onChange={(e) => updateMeasurement('neck', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter neck measurement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Calf ({unit})
                  </label>
                  <input
                    type="number"
                    value={measurements.calf}
                    onChange={(e) => updateMeasurement('calf', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter calf measurement"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={analyzeMeasurements}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Analyze Measurements
          </button>
          <button
            onClick={() => setShowManualMeasurements(false)}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            {userData.gender === 'female'
              ? 'Enter at least bust, waist, and hips for best results'
              : 'Enter at least chest, waist, and shoulders for best results'
            }
          </p>
        </div>
      </div>
    );

    // Manual Input Component
    const BodyShapeManualInput = ({ userData, handleManualSelection }: any) => {
      const femaleShapes = [
        {
          name: "Hourglass",
          image: HourglassImage,
          bgColor: "from-pink-400 to-rose-500",
          description: "Balanced proportions",
        },
        {
          name: "Rectangle",
          image: RectangleImage,
          bgColor: "from-blue-400 to-indigo-500",
          description: "Straight silhouette",
        },
        {
          name: "Inverted Triangle",
          image: InvertedTriangleImage,
          bgColor: "from-purple-400 to-violet-500",
          description: "Broad shoulders",
        },
        {
          name: "Apple",
          image: AppleImage,
          bgColor: "from-red-400 to-pink-500",
          description: "Full midsection",
        },
        {
          name: "Pear",
          image: PearImage,
          bgColor: "from-green-400 to-emerald-500",
          description: "Full hips",
        },
      ];

      const maleShapes = [
        {
          name: "Mesomorph",
          image: MesomorphImage,
          bgColor: "from-blue-500 to-cyan-500",
          description: "Athletic build",
        },
        {
          name: "Ectomorph",
          image: EctomorphImage,
          bgColor: "from-gray-400 to-slate-500",
          description: "Lean frame",
        },
        {
          name: "Trapezoid",
          image: TrapezoidImage,
          bgColor: "from-orange-400 to-amber-500",
          description: "V-shaped torso",
        },
        {
          name: "Endomorph",
          image: EndomorphImage,
          bgColor: "from-yellow-400 to-orange-500",
          description: "Fuller build",
        },
      ];

      const shapes = userData?.gender === "female" ? femaleShapes : maleShapes;

      return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Select Your Body Shape
          </h3>
          <p className="text-sm text-gray-300 text-center mb-6">
            Choose the body shape that best describes your natural silhouette
          </p>

          {/* Responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shapes.map((shape) => (
              <button
                key={shape.name}
                onClick={() => handleManualSelection(shape.name)}
                className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-white/20 bg-white/5 hover:border-white/50 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
              >
                {/* Body type image with background */}
                <div
                  className={`h-28 w-28 flex items-center justify-center rounded-xl mb-3 bg-gradient-to-br ${shape.bgColor} p-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  <Image
                    src={shape.image}
                    alt={shape.name}
                    width={90}
                    height={90}
                    className="object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Body type name */}
                <span className="text-sm font-semibold text-center mb-1">
                  {shape.name}
                </span>

                {/* Description */}
                <span className="text-xs text-gray-300 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {shape.description}
                </span>
              </button>
            ))}
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Hover over each option to see more details
            </p>
          </div>
        </div>
      );
    };

    // Camera Analysis Component
    const CameraAnalysis = () => (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">
          Body Shape Analysis
          <span className="ml-2 text-sm px-2 py-1 rounded bg-blue-500/20 text-blue-300">
            Camera
          </span>
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          Progress: {progress}% - {capturedImages.length}/3 images captured
        </p>

        {isAutoCapturing && (
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              Auto-capturing in progress...
            </div>
            <p className="text-sm text-gray-300">
              Please stay still while we capture 3 images
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Analyzing image...</p>
          </div>
        )}

        {/* Camera Feed */}
        {showCamera && (
          <div className="mb-6 flex flex-col items-center">
            <video
              ref={videoRef}
              className="w-full h-[70vh] md:max-w-md md:h-auto rounded-lg border-2 border-gray-700 mb-2 shadow-lg object-cover"
              autoPlay
              playsInline
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}

        {capturedImages.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Captured Images:</h4>
            <div className="grid grid-cols-3 gap-2">
              {capturedImages.map((img, index) => (
                <div
                  key={index}
                  className="bg-white/20 rounded p-2 text-center text-sm"
                >
                  <img
                    src={img}
                    alt={`Image ${index + 1}`}
                    className="w-full h-20 object-cover rounded mb-1"
                  />
                  Image {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysisResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Analysis Results:</h4>
            <div className="space-y-1">
              {analysisResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-300">
                  Image {index + 1}: {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => handleManualInput("body_shape")}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Manual Input Instead
        </button>
      </div>
    );

    return (
      <>
        {/* Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen hidden md:flex bg-[#251F1E] items-center justify-center text-white p-4 md:p-8"
        >
          <div className="mx-auto flex flex-col items-center w-full">
            {/* Progress */}
            <div className="w-full mb-6">
              <ProgressBar currentStep={STEPS.BODY_ANALYSIS} />
            </div>

            <div className="w-full flex flex-col md:flex-row gap-6 items-stretch">
              {/* LEFT PANEL: IMAGE / CAMERA / UPLOAD */}
              <div className="md:w-[65%] w-full flex items-center justify-center relative rounded-lg overflow-hidden min-h-[60vh] md:min-h-[80vh]">
                {showUpload && uploadedImage ? (
                  <Image
                    src={uploadedImage}
                    alt="Uploaded body"
                    fill
                    className="object-contain"
                  />
                ) : showManualInput && currentAnalysis === "body_shape" ? (
                  <BodyShapeManualInput
                    userData={userData}
                    handleManualSelection={handleManualSelection}
                  />
                ) : showManualMeasurements ? (
                  <ManualMeasurementsInput />
                ) : currentAnalysis === "body_shape" && !showManualInput && !showUpload ? (
                  <CameraAnalysis />
                ) : (
                  <Image
                    src={BodyPhoto}
                    alt="Placeholder Body"
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {/* RIGHT PANEL: CONTROLS */}
              <div className="md:w-[35%] w-full flex flex-col space-y-6">
                <div className="w-full h-auto bg-[#444141] p-4 rounded-3xl backdrop-blur-lg text-white">
                  <h3 className="text-lg font-bold mb-3">
                    Analysis Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Body Shape:</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${analysisData.body_shape
                          ? "bg-green-500/20 text-green-300"
                          : "bg-gray-500/20 text-gray-300"
                          }`}
                      >
                        {analysisData.body_shape || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="w-full bg-[#444141] p-5 rounded-3xl text-white">
                  <h1 className="text-xl font-bold mb-4">
                    Body Shape Analysis Instructions
                  </h1>
                  <ul className="list-disc list-inside text-sm space-y-2 mb-3">
                    <li>Wear fitted or light clothing (avoid bulky outfits).</li>
                    <li>Stand straight in front of the camera.</li>
                    <li>Keep the background clear (avoid clutter).</li>
                    <li>Ensure full body is visible in frame.</li>
                  </ul>
                  <p className="text-sm">
                    ✨ <span className="font-semibold">Tip:</span> Stand about 2-3 meters away for better results.
                  </p>
                </div>

                {/* Upload Section */}
                <div className="flex flex-col items-center bg-[#444141] p-4 rounded-3xl text-center">
                  <h1 className="text-lg font-bold mb-3">
                    Upload picture from your device
                  </h1>
                  <button
                    onClick={() => startAnalysis("body_shape", "upload")}
                    className="border-2 border-white px-6  text-white rounded-full font-semibold hover:border-white/70 transition-all"
                  >
                    Upload +
                  </button>
                </div>

                {/* Camera Button */}
                <button
                  onClick={() => startAnalysis("body_shape", "camera")}
                  className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555] transition-all"
                >
                  Capture from Web Camera
                </button>

                {/* Manual Input */}
                <button
                  onClick={() => handleManualInput("body_shape")}
                  className="w-full text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="underline">Or Insert Manually</span>
                </button>

                {/* Manual Measurements */}
                <button
                  onClick={handleManualMeasurements}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  📏 Insert Measurements Manually
                </button>

                {/* Navigation */}
                <div className="flex justify-between gap-4 mt-6">
                  <button
                    onClick={() => setCurrentStep(STEPS.SKIN_FACE_ANALYSIS)}
                    className="w-1/2 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (singleMode && singleTarget === 'body') {
                        saveSingleModeAndReturn({ body_shape: analysisData.body_shape || null });
                      } else {
                        handleNext();
                      }
                    }}
                    disabled={!analysisData.body_shape}
                    className="w-1/2 py-3 rounded-lg bg-[#444141] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#555] transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </motion.div>

        {/* Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen md:hidden bg-[#251F1E] flex items-center justify-center text-white p-4 md:p-8"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full">
              <ProgressBar currentStep={STEPS.BODY_ANALYSIS} />
            </div>

            {/* Show upload analysis if active */}
            {showUpload && currentAnalysis && (
              <div className="mb-8">
                <UploadAnalysis />
              </div>
            )}

            {/* Show camera analysis if active */}
            {currentAnalysis && !showManualInput && !showUpload && (
              <div className="mb-8">
                <CameraAnalysis />
              </div>
            )}

            {/* Show manual input if active */}
            {showManualInput && currentAnalysis === "body_shape" && (
              <BodyShapeManualInput
                userData={userData}
                handleManualSelection={handleManualSelection}
              />
            )}

            {/* Show manual measurements if active */}
            {showManualMeasurements && (
              <ManualMeasurementsInput />
            )}

            {/* Show analysis options if no analysis is active */}
            {!currentAnalysis && !showManualInput && !showManualMeasurements && (
              <div className="w-full md:w-[100vw] md:h-[80vh] gap-8">
                {/* Body Analysis */}
                <div className="backdrop-blur-lg rounded-xl p-6 mt-20">
                  <div className="flex flex-col gap-6 items-start">
                    {/* Image Section - Now on Top */}
                    <div className="w-full flex items-center justify-center relative overflow-hidden">
                      <Image
                        src={MobileBodyPhoto}
                        alt="Body Photo"
                        height={200}
                        width={200}
                        className="object-cover w-[300px] h-[300px] rounded-full"
                      />
                    </div>

                    {/* Content Section - Now Below */}
                    <div className="w-full flex flex-col space-y-4">
                      <button
                        onClick={() => setShowBodyInstructions(true)}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555555] transition-all"
                      >
                        ‹ Instructions
                      </button>
                      {/* Analysis Status */}
                      <div className="w-full h-auto bg-[#444141] p-4 rounded-3xl backdrop-blur-lg text-white">
                        <h3 className="text-lg font-bold mb-3">
                          Analysis Status
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Body Shape:</span>
                            <span
                              className={`text-sm px-2 py-1 rounded ${analysisData.body_shape
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-500/20 text-gray-300"
                                }`}
                            >
                              {analysisData.body_shape || "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex bg-[#444141] p-6 rounded-3xl justify-center items-center flex-col">
                        <h1 className="text-xl font-bold mb-4 text-center">
                          Upload picture from your device
                        </h1>
                        <button
                          onClick={() => startAnalysis("body_shape", "upload")}
                          className="border-2 border-white px-16 text-white py-3 rounded-full font-semibold hover:border-white hover:from-green-600 hover:to-emerald-700 transition-all"
                        >
                          Upload Photo +
                        </button>
                      </div>

                      <button
                        onClick={handleMobileBodyCaptureClick}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                      >
                        Capture from Web Camera
                      </button>

                      <button
                        onClick={() => handleManualInput("body_shape")}
                        className="w-full text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <span className="underline">Manual Selection</span>
                      </button>

                      {/* Manual Measurements */}
                      <button
                        onClick={handleManualMeasurements}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        📏 Insert Measurements Manually
                      </button>



                      <div className="flex justify-center gap-4 mt-8">
                        <button
                          onClick={() =>
                            setCurrentStep(STEPS.SKIN_FACE_ANALYSIS)
                          }
                          className="px-8 py-3 w-full rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={!analysisData.body_shape}
                          className="px-8 py-3 w-full rounded-lg bg-white/10 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            {/* Mobile Preloader Overlay for Body (2s before camera capture) */}
            {isMobilePreloadingBody && (
              <div className="fixed inset-0 z-50 flex items-center justify-center ">
                <motion.div
                  initial={{ clipPath: "circle(0% at 50% 50%)" }}
                  animate={{ clipPath: "circle(150% at 50% 50%)" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="fixed inset-0 z-50"
                >
                  <Image
                    fill
                    alt="image"
                    src={mobilecam}
                    className="object-cover"
                  />
                </motion.div>
              </div>
            )}

            {/* Body Instructions Modal */}
            {showBodyInstructions && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#444141] rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      💪 Body Shape Analysis Instructions
                    </h3>
                    <button
                      onClick={() => setShowBodyInstructions(false)}
                      className="text-white hover:text-gray-300 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-white text-sm space-y-3">
                    <p>Follow these steps for best accuracy:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Wear fitted or light clothing (avoid bulky outfits).
                      </li>
                      <li>Stand straight in front of the camera.</li>
                      <li>Keep the background clear (avoid clutter).</li>
                      <li>Ensure full body is visible in frame.</li>
                    </ul>
                    <p className="mt-4">
                      ✨ <span className="font-semibold">Tip:</span> Stand about 2-3 meters away for better results.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </>
    );
  };

  const PersonalityAnalysisStep = ({
    userData,
    setUserDataState,
    setCurrentStep,
    STEPS,
  }: any) => {
    const [hasStarted, setHasStarted] = useState(false);
    const [showPersonalityInstructions, setShowPersonalityInstructions] =
      useState(false);

    const handleNext = (personalityType: string) => {
      const updatedData = { ...userData, personality: personalityType };
      updateUserData(updatedData);
      setUserDataState(updatedData);

      // Update localStorage with the new data
      localStorage.setItem('aurasync_user_data', JSON.stringify(updatedData));

      setCurrentStep(STEPS.COMPLETE);
    };

    return (
      <>
        {/* Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen hidden md:flex bg-[#251F1E] items-center justify-center text-white p-4 md:p-8"
        >
          <div className="mx-auto flex flex-col items-center w-full">
            {/* Progress */}
            <div className="w-full mb-6">
              <ProgressBar currentStep={STEPS.PERSONALITY_ANALYSIS} />
            </div>

            <div className="w-full flex flex-col md:flex-row gap-6">
              {/* LEFT PANEL: IMAGE / CONTENT */}
              <div className="md:w-[65%] w-full flex items-center justify-center h-[60vh] md:h-[80vh] relative rounded-lg overflow-hidden">
                <Image
                  src={PersonalityPhoto}
                  alt="Personality Analysis"
                  fill
                  className="object-contain"
                />
              </div>

              {/* RIGHT PANEL: CONTROLS */}
              <div className="md:w-[35%] w-full flex flex-col space-y-6">
                {/* Instructions */}
                <div className="w-full bg-[#444141] p-5 rounded-3xl text-white">
                  <h1 className="text-xl font-bold mb-4">
                    Personality Analysis Instructions
                  </h1>
                  <p className="text-sm text-gray-300 mb-3">
                    Welcome to the Personality Analysis Test! ✨
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    This test identifies your personality type (MBTI) to tailor fashion suggestions.
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-2 mb-3">
                    <li>16-20 questions in total.</li>
                    <li>Answer honestly - no right or wrong answers.</li>
                    <li>Trust your first instinct.</li>
                    <li>Think about your usual behavior.</li>
                    <li>Estimated time: 5-7 minutes.</li>
                  </ul>
                  <p className="text-sm">
                    ✨ <span className="font-semibold">Tip:</span> Take your time and be honest with your answers.
                  </p>
                </div>

                {/* Action Buttons */}
                {!hasStarted ? (
                  <>
                    <button
                      onClick={() => setHasStarted(true)}
                      className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555] transition-all"
                    >
                      Start the Test
                    </button>

                    <button
                      onClick={() => setCurrentStep(STEPS.COMPLETE)}
                      className="w-full text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <span className="underline">I&apos;ll do it later</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-[#444141] p-4 rounded-3xl text-center">
                    <h3 className="text-lg font-bold mb-2">Test in Progress</h3>
                    <p className="text-sm text-gray-300">
                      Complete the personality assessment to continue
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between gap-4 mt-6">
                  <button
                    onClick={() => setCurrentStep(STEPS.BODY_ANALYSIS)}
                    className="w-1/2 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
                  >
                    Back
                  </button>
                  {!hasStarted && (
                    <button
                      onClick={() => setCurrentStep(STEPS.COMPLETE)}
                      className="w-1/2 py-3 rounded-lg bg-[#444141] text-white font-semibold hover:bg-[#555] transition-all"
                    >
                      Skip
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {hasStarted && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center ">
              <div className="relative w-full h-full md:w-[100vw] md:h-[100vh] bg-[#251F1E] rounded-none md:rounded-2xl p-4 md:p-8 overflow-auto">

                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full">
                    <PersonalityAnalysisWidget onComplete={handleNext} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen md:hidden bg-[#251F1E] flex items-center justify-center text-white p-4 md:p-8"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full">
              <ProgressBar currentStep={STEPS.PERSONALITY_ANALYSIS} />
            </div>

            {!hasStarted ? (
              <div className="w-full md:w-[100vw] md:h-[80vh] gap-8">
                {/* Personality Analysis */}
                <div className="backdrop-blur-lg rounded-xl p-6 mt-20">
                  <div className="flex flex-col gap-6 items-start">
                    {/* Image Section - Now on Top */}
                    <div className="w-full flex items-center justify-center relative overflow-hidden">
                      <Image
                        src={MobilePersonalityPhoto}
                        alt="Personality Analysis"
                        height={200}
                        width={200}
                        className="object-cover w-[300px] h-[300px] rounded-full"
                      />
                    </div>

                    {/* Content Section - Now Below */}
                    <div className="w-full flex flex-col space-y-4">
                      {/* Instructions */}
                      <div className="w-full h-auto bg-[#444141] p-4 rounded-3xl backdrop-blur-lg text-white">
                        <h3 className="text-lg font-bold mb-3">
                          Personality Analysis Instructions
                        </h3>
                        <p className="text-sm text-gray-300 mb-3">
                          Welcome to the Personality Analysis Test! ✨
                        </p>
                        <p className="text-sm text-gray-300 mb-3">
                          This test identifies your personality type (MBTI) to tailor fashion suggestions.
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 mb-3">
                          <li>16-20 questions in total.</li>
                          <li>Answer honestly - no right or wrong answers.</li>
                          <li>Trust your first instinct.</li>
                          <li>Think about your usual behavior.</li>
                          <li>Estimated time: 5-7 minutes.</li>
                        </ul>
                        <p className="text-sm">
                          ✨ <span className="font-semibold">Tip:</span> Take your time and be honest with your answers.
                        </p>
                      </div>

                      <button
                        onClick={() => setHasStarted(true)}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555] transition-all"
                      >
                        Start the Test
                      </button>

                      <button
                        onClick={() => setShowPersonalityInstructions(true)}
                        className="w-full bg-[#444141] text-white py-3 rounded-lg font-semibold hover:bg-[#555555] transition-all"
                      >
                        Instructions
                      </button>

                      <button
                        onClick={() => setCurrentStep(STEPS.COMPLETE)}
                        className="w-full text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <span className="underline">I&apos;ll do it later</span>
                      </button>

                      <div className="flex justify-center gap-4 mt-8">
                        <button
                          onClick={() => setCurrentStep(STEPS.BODY_ANALYSIS)}
                          className="px-8 py-3 rounded-lg border-2 border-white/30 bg-white/10 text-white hover:border-white/50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setCurrentStep(STEPS.COMPLETE)}
                          className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full mt-20">
                <PersonalityAnalysisWidget onComplete={handleNext} />
              </div>
            )}

            {/* Personality Instructions Modal */}
            {showPersonalityInstructions && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#444141] rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      🧠 Personality Analysis Instructions
                    </h3>
                    <button
                      onClick={() => setShowPersonalityInstructions(false)}
                      className="text-white hover:text-gray-300 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-white text-sm space-y-3">
                    <p>Welcome to the Personality Analysis Test! ✨</p>
                    <p>
                      This test identifies your personality type (MBTI) to tailor
                      fashion suggestions.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>16-20 questions in total.</li>
                      <li>Answer honestly - no right or wrong answers.</li>
                      <li>Trust your first instinct.</li>
                      <li>Think about your usual behavior.</li>
                      <li>Estimated time: 5-7 minutes.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Personality Instructions Modal */}
        {showPersonalityInstructions && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#444141] rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  ðŸ§ Personality Analysis Instructions
                </h3>
                <button
                  onClick={() => setShowPersonalityInstructions(false)}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  Ã—
                </button>
              </div>
              <div className="text-white text-sm space-y-3">
                <p>Welcome to the Personality Analysis Test! âœ¨</p>
                <p>
                  This test identifies your personality type (MBTI) to tailor
                  fashion suggestions.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>16-20 questions in total.</li>
                  <li>Answer honestly - no right or wrong answers.</li>
                  <li>Trust your first instinct.</li>
                  <li>Think about your usual behavior.</li>
                  <li>Estimated time: 5-7 minutes.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Step 6: Complete Component
  const CompleteStep = ({ userData }: any) => {
    const handleComplete = async () => {
      // Update user data with onboarding completed flag
      const completedUserData = { ...userData, onboarding_completed: true };
      markOnboardingCompleted();

      // Complete onboarding by sending all user data to backend
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

          const response = await axios.put(
            `${API_URL}/auth/update-onboarding`,
            {
              name: completedUserData.name,
              gender: completedUserData.gender,
              location: completedUserData.location || "Mumbai", // Default location
              skin_tone: completedUserData.skin_tone,
              face_shape: completedUserData.face_shape,
              body_shape: completedUserData.body_shape,
              personality: completedUserData.personality,
              onboarding_completed: true
            },
            {
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200) {
            console.log('Onboarding completed successfully:', response.data);

            // Store updated user data in localStorage for other pages to access
            localStorage.setItem('aurasync_user_data', JSON.stringify(completedUserData));
          } else {
            console.error('Failed to complete onboarding');
          }
        }
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
        // Continue with redirect even if backend sync fails
      }

      // Redirect to dashboard after completing onboarding
      router.push(completedUserData.gender == "male" ? "/male" : "/female");
    };

    return (
      <>
        {/* Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen hidden md:flex items-center justify-center bg-[#251F1E]"
        >
          <div className="text-center text-white p-8">

            <div className="text-6xl text-center flex gap-6 mb-6">


            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Auraasync!
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Your personalized fashion journey is ready to begin
            </p>

            <button
              onClick={handleComplete}
              className="text-white bg-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Start Exploring
            </button>
          </div>
        </motion.div>

        {/* Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen md:hidden flex items-center justify-center bg-[#251F1E]"
        >
          <div className="text-center text-white p-8">
            <ProgressBar currentStep={STEPS.COMPLETE} />
            <div className="text-4xl flex gap-4 mb-6 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-party-popper h-6 w-6 text-amber-300"
                aria-hidden="true"
              >
                <path d="M5.8 11.3 2 22l10.7-3.79"></path>
                <path d="M4 3h.01"></path>
                <path d="M22 8h.01"></path>
                <path d="M15 2h.01"></path>
                <path d="M22 20h.01"></path>
                <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"></path>
                <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"></path>
                <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"></path>
                <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"></path>
              </svg>
              <span className="text-lg">Quiz Completed</span>
            </div>
            <h1 className="text-3xl font-bold mb-6">Welcome to Auraasync!</h1>
            <p className="text-lg mb-8 text-gray-300">
              Your personalized fashion journey is ready to begin
            </p>

            <button
              onClick={handleComplete}
              className="text-white bg-blue-600 px-6 py-3 rounded-lg font-semibold text-base hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Start Exploring
            </button>
          </div>
        </motion.div>
      </>
    );
  };

  // Render current step
  return (
    <AnimatePresence mode="wait">
      {currentStep === STEPS.LOGIN && <LoginStep key="login" />}

      {currentStep === STEPS.BASIC_INFO && (
        <BasicInfoStep
          key="basic_info"
          userData={userData}
          updateUserData={updateUserData}
          setUserDataState={setUserDataState}
          setCurrentStep={setCurrentStep}
          STEPS={STEPS}
        />
      )}

      {currentStep === STEPS.SKIN_FACE_ANALYSIS && (
        <SkinFaceAnalysisStep
          key="skin_analysis"
          userData={userData}
          setUserDataState={setUserDataState}
          setCurrentStep={setCurrentStep}
          STEPS={STEPS}
        />
      )}

      {currentStep === STEPS.BODY_ANALYSIS && (
        <BodyAnalysisStep
          key="body_analysis"
          userData={userData}
          setUserDataState={setUserDataState}
          setCurrentStep={setCurrentStep}
          STEPS={STEPS}
        />
      )}

      {currentStep === STEPS.PERSONALITY_ANALYSIS && (
        <PersonalityAnalysisStep
          key="personality_analysis"
          userData={userData}
          setUserDataState={setUserDataState}
          setCurrentStep={setCurrentStep}
          STEPS={STEPS}
        />
      )}

      {currentStep === STEPS.COMPLETE && (
        <CompleteStep key="complete" userData={userData} />
      )}
    </AnimatePresence>
  );
}
