import React, { useState, useRef } from "react";
import axios from "axios";

export default function FaceTypeScanner({ onComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError("");
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${API}/analyze/face`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
      if (onComplete) onComplete(res.data);
    } catch (err) {
      setError("Error uploading image or getting prediction.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181e29] text-white p-4">
      <h1 className="text-4xl font-bold mb-12 text-center">Face Shape Analysis</h1>
      <div className="flex flex-row gap-4 mb-12">
        <input
          type="file"
          accept="image/*"
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
          <video ref={videoRef} autoPlay playsInline className="rounded border mb-2 max-h-64" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          {countdown > 0 ? (
            <div className="text-3xl font-bold text-yellow-600 mb-2">{countdown}</div>
          ) : (
            <button type="button" className="bg-blue-600 px-6 py-2 rounded text-white font-bold" onClick={async () => {
              if (timer > 0) {
                setCountdown(timer);
                let interval = setInterval(() => {
                  setCountdown(prev => {
                    if (prev <= 1) {
                      clearInterval(interval);
                      setCountdown(0);
                      // Capture
                      if (videoRef.current && canvasRef.current) {
                        const video = videoRef.current;
                        const canvas = canvasRef.current;
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob(blob => {
                          if (blob) {
                            setFile(new File([blob], 'captured.png', { type: 'image/png' }));
                            setPreview(URL.createObjectURL(blob));
                            setShowCamera(false);
                          }
                        }, 'image/png');
                      }
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
              } else {
                // Capture immediately
                if (videoRef.current && canvasRef.current) {
                  const video = videoRef.current;
                  const canvas = canvasRef.current;
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(blob => {
                    if (blob) {
                      setFile(new File([blob], 'captured.png', { type: 'image/png' }));
                      setPreview(URL.createObjectURL(blob));
                      setShowCamera(false);
                    }
                  }, 'image/png');
                }
              }
            }}>Capture Photo</button>
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
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full py-3 px-4 rounded text-white font-medium ${
          !file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning...
          </span>
        ) : (
          "Scan Face Shape"
        )}
      </button>
      {/* Results */}
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded shadow-inner">
          <h3 className="text-xl font-semibold mb-2">🔍 Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Face Shape</p>
              <p className="text-lg font-bold capitalize">{result.face_shape || 'Unknown'}</p>
            </div>
            {result.confidence && (
              <div>
                <p className="text-sm text-gray-500">Confidence</p>
                <span>{(result.confidence * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 