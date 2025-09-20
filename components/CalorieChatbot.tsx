import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { getCalorieCoachResponse } from '../services/geminiService';
import { Send, Sparkles, User, Loader2, X } from 'lucide-react';

export default function CalorieChatbot({ onClose }: { onClose: () => void }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatbotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Start with a greeting from the AI
        setMessages([
            {
                role: 'model',
                text: `Hi! I'm the iFit Calorie Coach. Ask me about any food to get a quick calorie and nutrition estimate.\n\nFor example: "Chicken breast 100g"`
            }
        ]);
    }, []);
    
    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    
    // Handle clicks outside the chatbot to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getCalorieCoachResponse([...messages, userMessage]);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Calorie Coach Error:", error);
            const errorMessage: ChatMessage = {
                role: 'model',
                text: "Sorry, I couldn't process that. Please try again."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
        >
            <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out; }`}</style>
            <div ref={chatbotRef} className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md h-[70vh] flex flex-col border border-gray-700">
                <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-lime-400" />
                        <h2 className="text-xl font-bold text-white">AI Calorie Coach</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close chatbot">
                        <X size={24} />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-lime-400" />
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-sm p-3 rounded-lg text-sm ${
                                msg.role === 'user' 
                                    ? 'bg-gray-700 text-white rounded-br-none' 
                                    : 'bg-gray-900 text-gray-300 rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                             {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                               <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
                            </div>
                            <div className="max-w-sm md:max-w-md p-3 rounded-lg bg-gray-900 text-gray-400 text-sm italic rounded-bl-none">
                                Coach is typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                 <div className="p-3 border-t border-gray-700 mt-auto bg-gray-800">
                    <form onSubmit={handleSend}>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g., How many calories in an apple?"
                                disabled={isLoading}
                                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2 bg-lime-500 text-black rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
