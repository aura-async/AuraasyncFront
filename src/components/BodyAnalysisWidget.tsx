"use client";

import React, { useState, useRef } from 'react';
import { guessFemaleType, guessMaleType } from '../lib/bodyTypes';

interface BodyAnalysisWidgetProps {
  onComplete?: (result: { body_shape?: string }) => void;
}

const BodyAnalysisWidget: React.FC<BodyAnalysisWidgetProps> = ({ onComplete }) => {
  const [result, setResult] = useState<{ body_shape?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraAllowed, setCameraAllowed] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [measurements, setMeasurements] = useState({
    bust: '',
    waist: '',
    hips: '',
    shoulders: '',
    chest: '',
    bicep: ''
  });
  const [gender, setGender] = useState<'male' | 'female'>('female');

  // Fallback analysis using measurements
  const performFallbackAnalysis = () => {
    const measurementsNum = {
      bust: parseFloat(measurements.bust) || 0,
      waist: parseFloat(measurements.waist) || 0,
      hips: parseFloat(measurements.hips) || 0,
      shoulders: parseFloat(measurements.shoulders) || 0,
      chest: parseFloat(measurements.chest) || 0,
      bicep: parseFloat(measurements.bicep) || 0
    };

    let bodyShape = 'Unknown';
    try {
      if (gender === 'female') {
        const results = guessFemaleType(measurementsNum);
        bodyShape = results.length > 0 ? results[0].label : 'Unknown';
      } else {
        const results = guessMaleType(measurementsNum);
        bodyShape = results.length > 0 ? results[0].label : 'Unknown';
      }
    } catch (err) {
      console.error('Fallback analysis failed:', err);
    }

    setResult({ body_shape: bodyShape });
    setShowNext(true);
    setShowManualInput(false);
  };

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
      const res = await fetch(`${API}/analyze/body`, {
        method: 'POST',
        signal: controller.signal,
        body: formData,
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        if (res.status === 422) {
          const errorData = await res.json();
          if (errorData.error === 'body_not_detected') {
            setError('Body not clearly visible. Please try again with better lighting or use manual input below.');
            setShowManualInput(true);
            return;
          }
        }
        throw new Error('Failed to analyze image');
      }
      
      const data = await res.json();
      setResult(data);
      setShowNext(true);
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
              const res = await fetch(`${API}/analyze/body`, {
                method: 'POST',
                signal: controller.signal,
                body: formData,
              });
              clearTimeout(timeoutId);
              
              if (!res.ok) {
                if (res.status === 422) {
                  const errorData = await res.json();
                  if (errorData.error === 'body_not_detected') {
                    setError('Body not clearly visible. Please try again with better lighting or use manual input below.');
                    setShowManualInput(true);
                    return;
                  }
                }
                throw new Error('Failed to analyze image');
              }
              
              const data = await res.json();
              setResult(data);
              setShowNext(true);
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
      <h1 className="text-4xl font-bold mb-8 text-center">Body Type Analysis</h1>
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
      
      {showManualInput && (
        <div className="mt-6 p-6 bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">Manual Body Analysis</h3>
          <p className="text-gray-300 mb-4">Enter your measurements for analysis:</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bust (cm)</label>
              <input
                type="number"
                value={measurements.bust}
                onChange={(e) => setMeasurements(prev => ({ ...prev, bust: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Waist (cm)</label>
              <input
                type="number"
                value={measurements.waist}
                onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Hips (cm)</label>
              <input
                type="number"
                value={measurements.hips}
                onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="95"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Shoulders (cm)</label>
              <input
                type="number"
                value={measurements.shoulders}
                onChange={(e) => setMeasurements(prev => ({ ...prev, shoulders: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                placeholder="95"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={performFallbackAnalysis}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition"
            >
              Analyze
            </button>
            <button
              onClick={() => setShowManualInput(false)}
              className="flex-1 py-2 px-4 bg-gray-600 text-white font-semibold rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-6 bg-gray-800 rounded-xl shadow-lg flex flex-col items-center w-full max-w-md">
          <p className="text-2xl font-bold text-green-400">Body Shape: {result.body_shape ? result.body_shape : 'Unknown'}</p>
          {showNext && (
            <button
              className="mt-6 px-8 py-3 bg-indigo-600 rounded-xl text-xl font-bold hover:bg-indigo-700 transition"
              onClick={() => onComplete && onComplete(result)}
            >Next</button>
          )}
        </div>
      )}
    </div>
  );
};

export default BodyAnalysisWidget; 