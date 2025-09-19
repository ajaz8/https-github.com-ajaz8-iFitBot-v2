import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, PendingWorkoutPlan } from '../types';
import { getTrainerChatbotResponse } from '../services/geminiService';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';

export default function TrainerChatbot({ plan }: { plan: PendingWorkoutPlan }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Start with a greeting from the AI
        setMessages([
            {
                role: 'model',
                text: `Hello! I'm iFitBot. I'm ready to assist you with the plan for ${plan.userName}. How can I help you today?`
            }
        ]);
    }, [plan.userName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getTrainerChatbotResponse(plan, [...messages, userMessage]);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            const errorMessage: ChatMessage = {
                role: 'model',
                text: "Sorry, I encountered an error. Please try again."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 h-96 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-lime-400" />
                            </div>
                        )}
                        <div className={`max-w-sm md:max-w-md p-3 rounded-lg text-sm ${
                            msg.role === 'user' 
                                ? 'bg-gray-700 text-white' 
                                : 'bg-gray-700/50 text-gray-300'
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
                        <div className="max-w-sm md:max-w-md p-3 rounded-lg bg-gray-700/50 text-gray-400 text-sm italic">
                            iFitBot is thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-gray-700 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask or instruct—e.g., 'Shorten to 40 min and add knee-friendly options.'"
                    disabled={isLoading}
                    className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="ml-2 px-4 py-2 bg-lime-500 text-black rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
}