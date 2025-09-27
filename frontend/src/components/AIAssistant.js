import React, { useState, useEffect, useRef, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Sparkles,
  HelpCircle,
  Search,
  Car
} from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import axios from 'axios';

const AIAssistant = ({ isOpen = false, onToggle }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { user, token } = useContext(AuthContext);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([{
        id: 1,
        type: 'ai',
        content: 'Добро пожаловать в VELES DRIVE! Я ваш AI-помощник. Могу помочь найти автомобиль, ответить на вопросы о наших услугах или проконсультировать по платформе. Чем могу помочь?',
        timestamp: new Date(),
        suggestedActions: [
          'Найти автомобиль',
          'Узнать о кредитах', 
          'Помощь дилерам',
          'Техподдержка'
        ]
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('message', inputMessage);
      if (sessionId) {
        formData.append('session_id', sessionId);
      }

      const headers = {};
      if (user && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(`${backendUrl}/api/ai/chat`, formData, { headers });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        aiType: response.data.type,
        suggestedActions: response.data.suggested_actions || [],
        needsHuman: response.data.needs_human
      };

      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Извините, произошла ошибка. Попробуйте позже или обратитесь к нашим менеджерам.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedAction = (action) => {
    setInputMessage(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const MessageBubble = ({ message }) => (
    <div className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      {message.type === 'ai' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center">
          <Bot size={16} className="text-black" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
        <div className={`p-3 rounded-2xl ${
          message.type === 'user' 
            ? 'bg-yellow-600 text-black ml-auto' 
            : message.isError 
            ? 'bg-red-900/50 text-red-200 border border-red-700'
            : 'bg-gray-800 text-white border border-gray-700'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => handleSuggestedAction(action)}
                  className="text-xs bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  {action}
                </Button>
              ))}
            </div>
          )}

          {message.needsHuman && (
            <div className="mt-3 p-2 bg-blue-900/30 border border-blue-700 rounded">
              <p className="text-xs text-blue-300 flex items-center gap-2">
                <HelpCircle size={12} />
                Рекомендуем связаться с менеджером для детальной консультации
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          {message.aiType && (
            <Badge variant="secondary" className="text-xs">
              {message.aiType === 'recommendation' ? 'Рекомендация' : 
               message.aiType === 'action' ? 'Действие' : 'Информация'}
            </Badge>
          )}
        </div>
      </div>

      {message.type === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <User size={16} className="text-gray-300" />
        </div>
      )}
    </div>
  );

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black shadow-2xl"
      >
        <Bot size={24} />
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="bg-gray-900 border-gray-700 shadow-2xl h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center">
              <Bot size={16} className="text-black" />
            </div>
            <div>
              <CardTitle className="text-white text-sm">AI Помощник VELES</CardTitle>
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles size={12} className="animate-spin" />
                  Печатает...
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white p-1"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggle}
              className="text-gray-400 hover:text-red-400 p-1"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-1">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isTyping && (
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center">
                        <Bot size={16} className="text-black" />
                      </div>
                      <div className="bg-gray-800 p-3 rounded-2xl border border-gray-700">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Задайте вопрос..."
                  className="bg-gray-800 border-gray-600 text-white flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-yellow-600 text-black hover:bg-yellow-700 px-3"
                >
                  <Send size={16} />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSuggestedAction('Найти автомобиль до 2 млн рублей')}
                  className="text-xs bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                  <Search size={12} className="mr-1" />
                  Поиск авто
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSuggestedAction('Как получить кредит на автомобиль?')}
                  className="text-xs bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                  <HelpCircle size={12} className="mr-1" />
                  Кредиты
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSuggestedAction('Помощь с ERP системой')}
                  className="text-xs bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                  <Car size={12} className="mr-1" />
                  ERP помощь
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default AIAssistant;