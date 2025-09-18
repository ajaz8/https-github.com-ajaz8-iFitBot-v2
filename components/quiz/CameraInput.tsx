import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, XCircle, AlertTriangle, VideoOff } from 'lucide-react';

interface CameraInputProps {
    value: string | undefined; // Base64 data URL
    onChange: (value: string | undefined) => void;
}

export default function CameraInput({ value, onChange }: CameraInputProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraActive(false);
        }
    }, [stream]);
    
    const startCamera = async () => {
        stopCamera(); // Stop any existing stream
        setError(null);
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user" } 
            });
            setStream(newStream);
            setIsCameraActive(true);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access was denied. Please allow camera permissions in your browser settings to use this feature.");
            setIsCameraActive(false);
        }
    };

    useEffect(() => {
        // Cleanup function to stop the camera when the component unmounts
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onChange(dataUrl);
            }
            stopCamera();
        }
    };

    const clearPhoto = () => {
        onChange(undefined);
        setError(null);
        // The camera does not need to be started automatically after clearing.
    };
    
    if (value) {
        return (
            <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
                <img src={value} alt="Your selfie for analysis" className="rounded-lg shadow-lg w-full h-auto" />
                <div className="flex gap-4">
                    <button onClick={clearPhoto} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition">
                        <RefreshCw size={18} />
                        Retake Photo
                    </button>
                </div>
            </div>
        );
    }

    if (isCameraActive && stream) {
        return (
            <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
                <video ref={videoRef} autoPlay playsInline muted className="rounded-lg shadow-lg w-full h-auto bg-gray-900" />
                <div className="flex gap-4">
                     <button onClick={takePhoto} className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 px-6 rounded-lg transition">
                        <Camera size={20} />
                        Capture Photo
                    </button>
                    <button onClick={stopCamera} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition">
                        <VideoOff size={20} />
                        Stop Camera
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
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
            <button onClick={startCamera} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition">
                <Camera size={20} />
                Start Camera
            </button>
             <p className="text-xs text-gray-500 mt-2">You can skip this step by clicking 'Next'.</p>
        </div>
    );
}