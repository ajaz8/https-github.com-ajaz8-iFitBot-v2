
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, AlertTriangle, VideoOff, Upload, Loader2 } from 'lucide-react';

interface CameraInputProps {
    value: string | undefined; // Base64 data URL
    onChange: (value: string | undefined) => void;
}

export default function CameraInput({ value, onChange }: CameraInputProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStatus('idle');
    }, []);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const startCamera = async () => {
        if (status !== 'idle' && status !== 'error') return;
        
        setStatus('requesting');
        setError(null);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Use `oncanplay` to make sure the stream is ready
                videoRef.current.oncanplay = () => {
                    videoRef.current?.play();
                    setStatus('active');
                };
            } else {
                throw new Error("Video element not available.");
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Camera access was denied. Please allow camera permissions in your browser and try again.");
            setStatus('error');
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current && status === 'active') {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (context) {
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;
                canvas.width = videoWidth;
                canvas.height = videoHeight;
                
                // The CSS transform mirrors the preview for the user.
                // We draw the raw, unmirrored video stream to the canvas,
                // which results in a correctly oriented final image.
                context.drawImage(video, 0, 0, videoWidth, videoHeight);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onChange(dataUrl);
            }
            stopCamera();
        }
    };

    const clearPhoto = () => {
        onChange(undefined);
        setError(null);
        setStatus('idle');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
             if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file (e.g., PNG, JPG).');
                setStatus('error');
                return;
            }
            stopCamera(); // Stop camera if it's running
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
                setError(null);
                setStatus('idle');
            };
            reader.onerror = () => {
                setError("Failed to read the selected file.");
                setStatus('error');
            };
            reader.readAsDataURL(file);
        }
    };

    // Render logic based on props.value and internal state
    if (value) {
        return (
            <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
                <img src={value} alt="Your selfie for analysis" className="rounded-lg shadow-lg w-full h-auto" />
                <button onClick={clearPhoto} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition">
                    <RefreshCw size={18} />
                    Replace Photo
                </button>
            </div>
        );
    }
    
    if (status === 'active') {
        return (
            <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
                <video ref={videoRef} playsInline muted className="rounded-lg shadow-lg w-full h-auto bg-gray-900 border-2 border-lime-500/50" style={{ transform: 'scaleX(-1)' }} />
                <div className="flex gap-4">
                     <button onClick={takePhoto} className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-5 px-8 rounded-lg transition">
                        <Camera size={20} />
                        Capture Photo
                    </button>
                    <button onClick={stopCamera} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-8 rounded-lg transition">
                        <VideoOff size={20} />
                        Stop Camera
                    </button>
                </div>
            </div>
        );
    }

    // Default/idle/error/requesting view
    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {status === 'requesting' && (
                <div className="text-center text-white p-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-lime-500 mb-4" />
                    <p>Requesting camera access...</p>
                </div>
            )}

            {(status === 'idle' || status === 'error') && (
                <>
                    {error ? (
                        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : (
                        <div className="text-center text-gray-300">
                            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-500"/>
                            <p>This is optional but recommended for the most accurate AI analysis.</p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <button onClick={startCamera} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition w-full sm:w-auto">
                            <Camera size={20} />
                            Start Camera
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition w-full sm:w-auto">
                            <Upload size={20} />
                            Upload Photo
                        </button>
                    </div>
                     <p className="text-xs text-gray-500 mt-4">You can skip this step by clicking 'Skip' below.</p>
                </>
            )}
        </div>
    );
}