'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import AiStarsIcon from '@/components/icons/ai-stars';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { useAI } from '@/hooks/ai/useAI';
import { useCart } from '@/hooks/cart/useCart';
import { useSession } from '@/hooks/session/useSession';
import { useValidator } from '@/hooks/validation/useValidator';
import { prepareAIContext } from '@/lib/client/ai';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/providers/StoreProvider';
import { ChatInput } from './ai/ChatInput';
import { ChatMessages } from './ai/ChatMessages';
import { Suggestions } from './ai/Suggestions';
import { AiHelperFormData, ChatMessage as ChatMessageType, StructuredDataHandlers } from './ai/types';
import { DashboardCardProps } from './dashboard-card';

function AiHelperCard({ className, title, ...props }: Omit<DashboardCardProps, 'children'>) {
  const t = useTranslations('account.AiHelper');
  const { form } = useValidator('AiHelperValidationService', {
    question: '',
  });

  const { sendMessageWithContext, loading, error } = useAI();
  const { session } = useSession();
  const { refetch: refetchCart } = useCart();
  const cartStore = useCartStore();

  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ai-helper-chat-messages');
        if (saved) {
          const parsedMessages = JSON.parse(saved);
          if (Array.isArray(parsedMessages)) {
            return parsedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
          }
        }
      } catch (error) {
        console.error('Error loading chat messages from localStorage:', error);
        localStorage.removeItem('ai-helper-chat-messages');
      }
      return [];
    }
    return [];
  });
  const [isChatMode, setIsChatMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-helper-chat-mode');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-helper-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-helper-chat-mode', isChatMode.toString());
    }
  }, [isChatMode]);

  const handleQuestionSubmit = async (data: AiHelperFormData) => {
    if (!data.question.trim() || !session) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: data.question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsChatMode(true);

    try {
      const context = await prepareAIContext(session, cartStore);
      const aiResponse = await sendMessageWithContext(data.question, context);

      let responseContent = aiResponse.message;
      let responseData = null;
      let responseType = 'text';
      let cartRefresh = aiResponse.cartRefresh || false;

      try {
        // Remove markdown code block wrappers if present - AI from time to time returns markdown code block wrappers.
        let messageToParse = aiResponse.message;
        if (messageToParse.startsWith('```json\n') && messageToParse.endsWith('\n```')) {
          messageToParse = messageToParse.slice(7, -4); // Remove ```json\n and \n```
        } else if (messageToParse.startsWith('```\n') && messageToParse.endsWith('\n```')) {
          messageToParse = messageToParse.slice(4, -4); // Remove ```\n and \n```
        }

        const parsedMessage = JSON.parse(messageToParse);
        if (parsedMessage.message) {
          responseContent = parsedMessage.message;
        }
        if (parsedMessage.data) {
          responseData = parsedMessage.data;
        }
        if (parsedMessage.type) {
          responseType = parsedMessage.type;
        }
        if (parsedMessage.cartRefresh !== undefined) {
          cartRefresh = parsedMessage.cartRefresh;
        }
      } catch {
        // If parsing fails, use the raw message
      }

      const aiMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
        data: responseData,
        type: responseType,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (cartRefresh) {
        await refetchCart();
      }
    } catch (err) {
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        content: t('errorOccurred'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    form.reset();
  };

  const setQuestionValue = (question: string) => {
    form.setValue('question', question);
  };

  const handlers: StructuredDataHandlers = {
    setQuestionValue,
    handleQuestionSubmit,
  };

  const clearChat = () => {
    setMessages([]);
    setIsChatMode(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ai-helper-chat-messages');
      localStorage.removeItem('ai-helper-chat-mode');
      localStorage.setItem('ai-session-id', crypto.randomUUID());
    }
  };

  return (
    <div
      className={cn('flex flex-col h-96 bg-white rounded-xl border shadow-sm overflow-hidden', className)}
      {...props}
    >
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AiStarsIcon className="flex-shrink-0" />
            <CardTitle className="text-4xl font-bold">{title || t('title')}</CardTitle>
          </div>
          {isChatMode && (
            <Button variant="secondary" size="small" onClick={clearChat} className="text-sm">
              {t('clearChat')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-4">
        {isChatMode && <ChatMessages messages={messages} loading={loading} handlers={handlers} />}

        {!isChatMode && <Suggestions onSuggestionClick={setQuestionValue} />}
        <ChatInput form={form} onSubmit={handleQuestionSubmit} loading={loading} isChatMode={isChatMode} />
      </div>

      {error && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 text-sm">Error: {error.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AiHelperCard };
