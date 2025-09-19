
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceAssistantProps {
    textToSpeak: string;
    isEnabled: boolean;
    onToggle: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ textToSpeak, isEnabled, onToggle }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const soundsRef = useRef<{ start?: HTMLAudioElement, end?: HTMLAudioElement }>({});

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSupported(true);
            // Initialize sounds with valid, tiny MP3 data URIs to ensure cross-browser compatibility and fix "no supported sources" error.
            const startSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAABv//7dRgAj/8l/wAABgAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
            startSound.volume = 0.3;
            const endSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAABv//7dRgAn/8l/wAABgAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
            endSound.volume = 0.3;
            soundsRef.current = { start: startSound, end: endSound };
        }
    }, []);

    const findAndSetVoice = useCallback(() => {
        if (!isSupported) return;

        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return;

        // --- Voice Selection Logic ---
        // Prioritize high-quality, natural-sounding female voices.
        const bestVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google') && v.name.includes('Female')) ||
                        voices.find(v => v.lang.startsWith('en') && v.name.includes('Samantha')) || // Common on Apple devices
                        voices.find(v => v.lang.startsWith('en') && v.name.includes('Zira')) || // Common on Windows
                        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                        voices.find(v => v.lang.startsWith('en-US')) || // Fallback to any US English voice
                        voices[0]; // Fallback to the first available voice

        setSelectedVoice(bestVoice);
    }, [isSupported]);
    
    useEffect(() => {
        if (!isSupported) return;

        findAndSetVoice(); // Initial attempt
        window.speechSynthesis.addEventListener('voiceschanged', findAndSetVoice);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', findAndSetVoice);
            window.speechSynthesis.cancel();
        };
    }, [isSupported, findAndSetVoice]);

    useEffect(() => {
        if (isEnabled && textToSpeak && selectedVoice) {
            window.speechSynthesis.cancel(); // Cancel previous speech

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.voice = selectedVoice;
            utterance.pitch = 0.95; // Slightly lower pitch for a calmer, more natural tone.
            utterance.rate = 1.05;  // Slightly faster for a more conversational pace.

            utterance.onstart = () => {
                soundsRef.current.start?.play().catch(e => console.error("Error playing start sound:", e));
                setIsSpeaking(true);
            };
            utterance.onend = () => {
                soundsRef.current.end?.play().catch(e => console.error("Error playing end sound:", e));
                setIsSpeaking(false);
            };
            utterance.onerror = (e) => {
                console.error("Speech synthesis error:", e);
                soundsRef.current.end?.play().catch(e => console.error("Error playing end sound on error:", e));
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [textToSpeak, isEnabled, selectedVoice]);

    const handleToggle = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
        }
        onToggle();
    };

    if (!isSupported) {
        return null;
    }

    return (
        <button
            onClick={handleToggle}
            title={isEnabled ? "Disable Voice Assistant" : "Enable Voice Assistant"}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                isEnabled ? 'bg-lime-500/20 text-lime-400 hover:bg-lime-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
        >
            {isEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="hidden md:inline">{isEnabled ? (isSpeaking ? 'Speaking...' : 'Voice On') : 'Voice Off'}</span>
        </button>
    );
};

export default VoiceAssistant;