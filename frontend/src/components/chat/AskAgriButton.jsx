import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import './AskAgriButton.css';

const AskAgriButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "I am your smart assistant. How can I help you today ?" }
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
        title="Chat with AgriGov AI"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};
export default AskAgriButton;