import { useState } from 'react';
import { MessageCircle, Send, X, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatAssistant() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to help you navigate our healthcare platform. How can I assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');

  const quickHelp = [
    "How do I book an appointment?",
    "How do I find a doctor?",
    "What are your consultation types?",
    "How do I create an account?",
    "What are your operating hours?",
    "How much do consultations cost?"
  ];

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      text: currentMessage,
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Simple bot responses based on keywords
    setTimeout(() => {
      let botResponse = "";
      const msg = currentMessage.toLowerCase();
      
      if (msg.includes('book') || msg.includes('appointment')) {
        botResponse = "To book an appointment: 1) Click 'Find Doctors' from the homepage 2) Browse our specialists 3) Click 'Book Appointment' on your preferred doctor 4) Login or create an account 5) Select your preferred date and time. Need help with any specific step?";
      } else if (msg.includes('doctor') || msg.includes('find')) {
        botResponse = "You can find doctors by clicking 'Doctors' in the navigation menu. Use the search bar to find doctors by name or specialty, or filter by medical specialties like Cardiology, Dermatology, etc.";
      } else if (msg.includes('account') || msg.includes('login') || msg.includes('sign')) {
        botResponse = "To create an account, click 'Login' in the top right corner, then select 'Sign Up'. You can register as a Patient or Doctor. Fill in your details and you'll be ready to use our platform!";
      } else if (msg.includes('cost') || msg.includes('price') || msg.includes('fee')) {
        botResponse = "Consultation fees vary by doctor and consultation type. Video consultations typically range from $50-150, while chat consultations are usually $25-75. Exact pricing is shown when you select a doctor.";
      } else if (msg.includes('hours') || msg.includes('time') || msg.includes('available')) {
        botResponse = "Our platform is available 24/7! Doctors set their own availability hours. You can see available time slots when booking with each doctor. Emergency consultations are available round the clock.";
      } else if (msg.includes('video') || msg.includes('chat') || msg.includes('consultation')) {
        botResponse = "We offer: 📹 Video Consultations - Face-to-face meetings with doctors 💬 Instant Chat - Text-based consultations 📅 Scheduled Appointments - Book for later 🚨 Emergency Consultations - Immediate care when needed";
      } else if (msg.includes('profile') || msg.includes('dashboard')) {
        botResponse = "Access your dashboard by clicking 'Dashboard' in the menu after logging in. There you can view your appointments, medical history, prescriptions, and update your profile information.";
      } else if (msg.includes('payment') || msg.includes('pay')) {
        botResponse = "We accept all major credit cards, debit cards, and digital wallets. Payment is processed securely after your consultation. You'll receive a receipt via email automatically.";
      } else if (msg.includes('prescription') || msg.includes('medicine')) {
        botResponse = "Digital prescriptions are sent directly to your preferred pharmacy or can be downloaded from your dashboard. Your doctor will discuss any medications during your consultation.";
      } else if (msg.includes('emergency') || msg.includes('urgent')) {
        botResponse = "For medical emergencies, please call 911 immediately. For urgent but non-emergency care, use our 24/7 emergency consultation service available through the 'Emergency Care' button.";
      } else {
        botResponse = "I'd be happy to help! You can ask me about booking appointments, finding doctors, creating accounts, consultation types, payments, prescriptions, or anything else about using our healthcare platform. What would you like to know?";
      }

      const botMessage = {
        id: chatMessages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);

    setCurrentMessage('');
  };

  const handleQuickHelp = (question) => {
    setCurrentMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 border" data-testid="chat-assistant-modal">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span className="font-semibold" data-testid="text-chat-title">Healthcare Assistant</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200"
              data-testid="button-close-chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Help Options */}
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Quick Help:</p>
            <div className="flex flex-wrap gap-1">
              {quickHelp.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickHelp(question)}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  data-testid={`button-quick-help-${index}`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4" data-testid="chat-messages-container">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                data-testid={`message-${message.id}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm" data-testid={`text-message-content-${message.id}`}>{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask me anything..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button onClick={handleSendMessage} size="sm" data-testid="button-send-message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}