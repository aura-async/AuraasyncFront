'use client';

import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

interface SkinToneAnalysisWidgetProps {
  onComplete: (result: string) => void;
  onSkip: () => void;
}

const SkinToneAnalysisWidget: React.FC<SkinToneAnalysisWidgetProps> = ({
  onComplete,
  onSkip
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    } else {
      setError('Please upload a valid image file.');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const apiResponse = await fetch(`${API}/analyze/skin-tone`, {
        method: 'POST',
        signal: controller.signal,
        body: formData,
      });
      clearTimeout(timeoutId);
      if (!apiResponse.ok) {
        throw new Error('Failed to analyze image');
      }
      const data = await apiResponse.json();
      if (data.skin_tone && data.skin_tone !== 'Error' && data.skin_tone !== 'Unknown') {
        setResult(data.skin_tone);
      } else {
        setError(data.message || 'Could not determine skin tone. Please try again with better lighting.');
      }
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Camera capture logic with timer
  const handleCameraCapture = () => {
    if (timer > 0) {
      setCountdown(timer);
      let interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCountdown(0);
            captureFromWebcam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      captureFromWebcam();
    }
  };

  const captureFromWebcam = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'captured.png', { type: 'image/png' });
            setFile(file);
            setPreview(URL.createObjectURL(blob));
            setShowCamera(false);
            setResult(null);
            setError(null);
          });
      }
    }
  };

  const handleRetake = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleContinue = () => {
    if (result) onComplete(result);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181e29] text-white p-4">
      <h1 className="text-4xl font-bold mb-12 text-center">Skin Tone Analysis</h1>
      <div className="flex flex-row gap-4 mb-12">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="bg-[#232b3e] px-6 py-3 rounded-lg font-bold text-lg cursor-pointer hover:bg-[#2c3654] transition"
          style={{ color: 'white', minWidth: 140 }}
        />
        <button type="button" onClick={() => setShowCamera(true)} className="bg-green-600 px-6 py-3 rounded-lg text-white font-bold text-lg hover:bg-green-700 transition">Capture from Camera</button>
        <select value={timer} onChange={e => setTimer(Number(e.target.value))} className="bg-[#232b3e] text-white rounded-lg px-4 py-3 text-lg font-semibold">
          <option value={0}>No Timer</option>
          <option value={5}>5s Timer</option>
          <option value={10}>10s Timer</option>
        </select>
      </div>

      {showCamera && (
        <div className="mb-4 flex flex-col items-center">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/png"
            className="rounded border mb-2 max-h-64"
            videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
          />
          {countdown > 0 ? (
            <div className="text-3xl font-bold text-yellow-600 mb-2">{countdown}</div>
          ) : (
            <button type="button" className="bg-blue-600 px-6 py-2 rounded text-white font-bold" onClick={handleCameraCapture}>Capture Photo</button>
          )}
          <button type="button" className="mt-2 bg-gray-500 px-4 py-1 rounded text-white" onClick={() => setShowCamera(false)}>Cancel</button>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mb-6">
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full h-auto max-h-96 object-contain border rounded"
          />
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className={`py-3 px-8 rounded text-white font-medium ${
            !file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            "Analyze Skin Tone"
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded shadow-inner text-gray-900">
          <h3 className="text-xl font-semibold mb-2">🔍 Result</h3>
          <div className="mb-2">Skin Tone: <span className="font-bold capitalize">{result}</span></div>
          <button
            onClick={handleContinue}
            className="mt-4 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Continue
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-lg">{error}</div>
      )}
    </div>
  );
};

export default SkinToneAnalysisWidget; 