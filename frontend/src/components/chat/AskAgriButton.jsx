import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const AskAgriButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { text: "I am your smart assistant. How can I help you today ?", isUser: false }

  ]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !image) return;

    const userMessage = {
      role: 'user',
      text: message,
      image: preview
    };

    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);

    const formData = new FormData();
    formData.append('text', message);
    if (image) {
      formData.append('image', image);
    }

    // Reset inputs
    setMessage('');
    setImage(null);
    setPreview(null);

    try {
      const response = await api.post('chatbot/ask/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setChatHistory(prev => [...prev, { role: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.error || "Sorry, an error occurred while connecting to the server. Please try again later.";
      setChatHistory(prev => [...prev, { role: 'ai', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agrigov-chat-wrapper">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window-container fade-in-slide">
          {/* Header */}
          <div className="chat-header">
            <div className="header-info">
              <div className="ai-avatar">
                <MessageSquare size={18} />
              </div>
              <div className="header-text">
                <span className="ai-name">AgriGov AI</span>
                <span className="ai-status">Your Agricultural Assistant🌾</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="chat-messages custom-scrollbar">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`message-row ${chat.role === 'user' ? 'user-row' : 'ai-row'}`}>
                <div className={`message-bubble ${chat.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                  {chat.image && (
                    <div className="bubble-image">
                      <img src={chat.image} alt="Uploaded" />
                    </div>
                  )}
                  <p dir="ltr">{chat.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row ai-row">
                <div className="message-bubble ai-bubble loading-bubble">
                  <Loader2 className="animate-spin" size={18} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Image Preview Area */}
          {preview && (
            <div className="preview-container">
              <div className="preview-box">
                <img src={preview} alt="Preview" />
                <button onClick={() => { setImage(null); setPreview(null); }} className="remove-preview">
                  <X size={12} />
                </button>
              </div>
              <span className="preview-label"> Image ready to send </span>
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="input-wrapper">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="tool-btn"
                title="Upload Image"
              >
                <Camera size={20} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AgriGov..."
                dir="ltr"
              />
              <button
                onClick={handleSend}
                disabled={loading || (!message.trim() && !image)}
                className="send-btn"
              >
                <Send size={18} />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden-file-input"
            />
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-btn ${isOpen ? 'active' : ''}`}
        title="تحدث مع AgriGov AI"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      <style jsx>{`
        .agrigov-chat-wrapper {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .chat-window-container {
          width: 380px;
          height: 600px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          margin-bottom: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .chat-header {
          padding: 1.25rem 1.5rem;
          background: var(--primary-color, #10B981);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ai-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-text {
          display: flex;
          flex-direction: column;
        }

        .ai-name {
          font-weight: 700;
          font-size: 1.1rem;
          line-height: 1.2;
        }

        .ai-status {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          padding: 0;
          box-shadow: none;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.02));
        }

        .message-row {
          display: flex;
          width: 100%;
        }

        .user-row {
          justify-content: flex-end;
        }

        .ai-row {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          padding: 1rem;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.5;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }

        .user-bubble {
          background: var(--primary-color, #10B981);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .ai-bubble {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }

        .loading-bubble {
          padding: 0.75rem 1rem;
          color: var(--primary-color, #10B981);
        }

        .bubble-image {
          margin-bottom: 0.5rem;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .bubble-image img {
          width: 100%;
          display: block;
        }

        .preview-container {
          padding: 0.75rem 1.5rem;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .preview-box {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid var(--primary-color, #10B981);
        }

        .preview-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-preview {
          position: absolute;
          top: 0;
          right: 0;
          background: #ef4444;
          color: white;
          border: none;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-bottom-left-radius: 8px;
          padding: 0;
          box-shadow: none;
        }

        .preview-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        .chat-input-area {
          padding: 1.25rem 1.5rem;
          background: white;
          border-top: 1px solid #f3f4f6;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f3f4f6;
          padding: 0.5rem 0.75rem 0.5rem 0.5rem;
          border-radius: 16px;
          transition: 0.3s;
          border: 2px solid transparent;
        }

        .input-wrapper:focus-within {
          background: white;
          border-color: var(--primary-color, #10B981);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .input-wrapper input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 0.5rem;
          font-size: 0.95rem;
          color: #1f2937;
          margin: 0;
          box-shadow: none;
        }

        .tool-btn {
          color: #6b7280;
          background: transparent;
          border: none;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          border-radius: 10px;
          box-shadow: none;
        }

        .tool-btn:hover {
          background: #e5e7eb;
          color: var(--primary-color, #10B981);
          transform: none;
        }

        .send-btn {
          width: 40px;
          height: 40px;
          background: var(--primary-color, #10B981);
          color: white;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          padding: 0;
        }

        .send-btn:hover {
          background: var(--primary-hover, #059669);
          transform: translateY(-2px);
        }

        .send-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        .fab-btn {
          width: 64px;
          height: 64px;
          background: var(--primary-color, #10B981);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          padding: 0;
        }

        .fab-btn:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
          background: var(--primary-hover, #059669);
        }

        .fab-btn.active {
          transform: rotate(90deg);
          background: #1f2937;
          box-shadow: 0 8px 25px rgba(31, 41, 55, 0.3);
        }

        .hidden-file-input {
          display: none;
        }

        .fade-in-slide {
          animation: fadeInSlideUp 0.3s ease-out;
        }

        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        @media (max-width: 480px) {
          .chat-window-container {
            width: calc(100vw - 2rem);
            height: 500px;
            bottom: 5rem;
            right: 1rem;
          }
          .agrigov-chat-wrapper {
            bottom: 1rem;
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AskAgriButton;
