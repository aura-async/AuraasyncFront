"use client";

import React, { useState, useRef } from 'react';

interface FaceAnalysisWidgetProps {
  onComplete?: (result: { face_shape?: string }) => void;
}

const FaceAnalysisWidget: React.FC<FaceAnalysisWidgetProps> = ({ onComplete }) => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraAllowed, setCameraAllowed] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('file', file);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API}/analyze/face`, {
        method: 'POST',
        signal: controller.signal,
        body: formData,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        if (res.status === 422) {
          const errorData = await res.json();
          if (errorData.error === 'face_not_detected') {
            throw new Error('Face not clearly visible. Please ensure your face is well-lit and clearly visible in the image.');
          } else if (errorData.error === 'skin_not_detected') {
            throw new Error('Skin tone not clearly visible. Please ensure good lighting and clear skin visibility.');
          }
        }
        throw new Error('Failed to analyze image');
      }
      
      const data = await res.json();
      setResult(data.face_shape || 'Unknown');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    setShowCamera(true);
    setError(null);
    setResult(null);
    setPreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraAllowed(true);
    } catch (err) {
      setCameraAllowed(false);
      setError('Camera access denied or not available.');
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (timer > 0) {
      setCountdown(timer);
      let interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCountdown(0);
            doCapture();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      doCapture();
    }
  };

  const doCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            setPreview(URL.createObjectURL(blob));
            setShowCamera(false);
            if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach((track) => track.stop());
              videoRef.current.srcObject = null;
            }
            setLoading(true);
            setError(null);
            setResult(null);
            const formData = new FormData();
            formData.append('file', new File([blob], 'captured.png', { type: 'image/png' }));
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 15000);
              const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              const res = await fetch(`${API}/analyze/face`, {
                method: 'POST',
                signal: controller.signal,
                body: formData,
              });
              clearTimeout(timeoutId);
              
              if (!res.ok) {
                if (res.status === 422) {
                  const errorData = await res.json();
                  if (errorData.error === 'face_not_detected') {
                    throw new Error('Face not clearly visible. Please ensure your face is well-lit and clearly visible in the image.');
                  } else if (errorData.error === 'skin_not_detected') {
                    throw new Error('Skin tone not clearly visible. Please ensure good lighting and clear skin visibility.');
                  }
                }
                throw new Error('Failed to analyze image');
              }
              
              const data = await res.json();
              setResult(data.face_shape || 'Unknown');
            } catch (err: any) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }
        }, 'image/png');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Face Analysis</h1>
      <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-xl mb-8">
        <label className="flex items-center bg-gray-800 rounded px-4 py-2 cursor-pointer hover:bg-gray-700 transition">
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <span className="font-semibold">Choose File</span>
          {preview && <span className="ml-2 text-green-400">{preview.split('/').pop()}</span>}
        </label>
        <button
          type="button"
          onClick={openCamera}
          className="py-2 px-6 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md"
        >
          Capture from Camera
        </button>
        <select value={timer} onChange={e => setTimer(Number(e.target.value))} className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition">
          <option value={0}>No Timer</option>
          <option value={5}>5 Seconds</option>
          <option value={10}>10 Seconds</option>
        </select>
      </div>
      {showCamera && (
        <div className="mb-6 flex flex-col items-center">
          {cameraAllowed ? (
            <>
              <video ref={videoRef} className="w-full max-w-md rounded-lg border-2 border-gray-700 mb-2 shadow-lg" autoPlay playsInline />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {countdown > 0 ? (
                <div className="text-4xl font-bold text-red-500 mb-2 animate-pulse">{countdown}</div>
              ) : null}
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="py-2 px-6 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
                  disabled={countdown > 0}
                >
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="py-2 px-6 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500 transition shadow-md"
                  disabled={countdown > 0}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="text-red-500">Camera not available or permission denied.</p>
          )}
        </div>
      )}
      {preview && (
        <div className="mb-6 flex flex-col items-center">
          <img src={preview} alt="Preview" className="max-h-[420px] rounded-lg border-2 border-gray-700 shadow-lg" />
        </div>
      )}
      {loading && <p className="text-lg text-blue-400 font-semibold">Analyzing...</p>}
      {error && <p className="text-lg text-red-400 font-semibold">{error}</p>}
      {result && (
        <div className="mt-4 p-6 bg-gray-800 rounded-xl shadow-lg flex flex-col items-center w-full max-w-md">
          <p className="text-2xl font-bold text-green-400">Face Shape: {result}</p>
          <button
            className="mt-6 px-8 py-3 bg-indigo-600 rounded-xl text-xl font-bold hover:bg-indigo-700 transition"
            onClick={() => {
              if (onComplete) onComplete({ face_shape: result });
              setResult(null);
            }}
          >Next</button>
        </div>
      )}
    </div>
  );
};

export default FaceAnalysisWidget; 