"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./TickatchMascot.module.css";

interface Message {
  id: string;
  type: "user" | "bot" | "error";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface TickatchMascotProps {
  size?: "sm" | "md" | "lg";
}

export default function TickatchMascot({ size = "md" }: TickatchMascotProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: "안녕하세요! 티캐치입니다 👋\n무엇을 도와드릴까요?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  // 메시지 목록 스크롤 하단으로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 채팅창 열릴 때 입력창 포커스
  useEffect(() => {
    if (isChatOpen) {
      inputRef.current?.focus();
    }
  }, [isChatOpen]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // 메시지 전송
  const sendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const botMessageId = `bot-${Date.now()}`;

    // 1. 사용자 메시지 즉시 표시 (캐시/낙관적 업데이트)
    const userMessage: Message = {
      id: userMessageId,
      type: "user",
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // 2. 로딩 메시지 표시
    const loadingMessage: Message = {
      id: botMessageId,
      type: "bot",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // 3. API 호출 (TODO: 실제 API 연동)
    try {
      // TODO: 실제 챗봇 API 연동
      // const response = await fetch("/api/chatbot", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ message: trimmedInput }),
      // });
      // if (!response.ok) throw new Error("API Error");
      // const data = await response.json();

      // 임시: 2초 후 응답 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 임시 응답 (나중에 API 응답으로 대체)
      const botResponse = getBotResponse(trimmedInput);

      // 4. 로딩 메시지를 실제 응답으로 교체
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, content: botResponse, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat API Error:", error);
      
      // 5. 에러 시 로딩 메시지를 에러 메시지로 교체
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                type: "error",
                content: "현재 인터넷이 원활하지 않습니다. 잠시 후 다시 시도해주세요.",
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 봇 응답 (TODO: 실제 API로 대체)
  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("예매") || lowerInput.includes("티켓")) {
      return "예매 관련 문의시군요! 🎫\n\n원하시는 공연을 검색하시거나, 마이페이지 > 예매내역에서 예매 현황을 확인하실 수 있어요.";
    }
    if (lowerInput.includes("취소") || lowerInput.includes("환불")) {
      return "취소/환불 문의시군요.\n\n마이페이지 > 예매내역에서 취소 가능하며, 공연 3일 전까지 전액 환불됩니다. 자세한 환불 규정은 각 공연 상세페이지를 확인해주세요.";
    }
    if (lowerInput.includes("결제") || lowerInput.includes("카드")) {
      return "결제 관련 문의시군요 💳\n\n신용카드, 체크카드, 간편결제(카카오페이, 네이버페이 등)를 지원합니다. 결제 오류 시 고객센터로 연락주세요.";
    }
    if (lowerInput.includes("안녕") || lowerInput.includes("하이")) {
      return "안녕하세요! 반갑습니다 😊\n무엇을 도와드릴까요?";
    }
    if (lowerInput.includes("고마워") || lowerInput.includes("감사")) {
      return "도움이 되었다니 기쁩니다! 😄\n다른 궁금한 점이 있으시면 언제든 물어봐주세요!";
    }

    return "문의해 주셔서 감사합니다.\n\n더 자세한 상담이 필요하시면 고객센터(1588-0000)로 연락 주시거나, 1:1 문의를 이용해주세요!";
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* 마스코트 버튼 */}
      <button
        className={`${styles.mascotButton} ${sizeClass} ${isChatOpen ? styles.chatting : ""}`}
        onClick={toggleChat}
        aria-label={isChatOpen ? "채팅창 닫기" : "채팅창 열기"}
      >
        <div className={styles.mascotContainer}>
          <div className={styles.body}>
            {/* 헤드셋 */}
            <div className={styles.headset}>
              <div className={styles.headband}></div>
              <div className={`${styles.earpad} ${styles.earpadLeft}`}></div>
              <div className={`${styles.earpad} ${styles.earpadRight}`}></div>
              <div className={styles.mic}></div>
            </div>

            {/* 얼굴 */}
            <div className={styles.face}>
              <div className={styles.eyes}>
                <div className={styles.eye}></div>
                <div className={styles.eye}></div>
              </div>
              <div className={styles.cheeks}>
                <div className={styles.cheek}></div>
                <div className={styles.cheek}></div>
              </div>
              <div className={styles.mouth}></div>
            </div>

            {/* 손 */}
            <div className={styles.hands}>
              <div className={`${styles.hand} ${styles.handLeft}`}></div>
              <div className={`${styles.hand} ${styles.handRight}`}></div>
            </div>
          </div>
          <div className={styles.shadow}></div>
        </div>
      </button>

      {/* 채팅창 */}
      <div className={`${styles.chatWindow} ${isChatOpen ? styles.chatOpen : ""}`}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            {/* 마스코트 아바타 */}
            <div className={styles.chatAvatarMascot}>
              <div className={styles.miniBody}>
                <div className={styles.miniFace}>
                  <div className={styles.miniEyes}>
                    <div className={styles.miniEye}></div>
                    <div className={styles.miniEye}></div>
                  </div>
                  <div className={styles.miniMouth}></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className={styles.chatTitle}>티캐치 도우미</h3>
              <p className={styles.chatStatus}>온라인</p>
            </div>
          </div>
          <button className={styles.chatClose} onClick={toggleChat}>
            ✕
          </button>
        </div>

        <div className={styles.chatBody}>
          <div className={styles.chatMessages}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.type === "user"
                    ? styles.userMessage
                    : message.type === "error"
                    ? styles.errorMessage
                    : styles.botMessage
                }
              >
                {message.type !== "user" && (
                  <div className={styles.messageAvatar}>
                    {message.type === "error" ? (
                      <span>⚠️</span>
                    ) : (
                      <div className={styles.msgMiniBody}>
                        <div className={styles.msgMiniFace}>
                          <div className={styles.msgMiniEyes}>
                            <div className={styles.msgMiniEye}></div>
                            <div className={styles.msgMiniEye}></div>
                          </div>
                          <div className={styles.msgMiniMouth}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={
                    message.type === "user"
                      ? styles.userBubble
                      : message.type === "error"
                      ? styles.errorBubble
                      : styles.messageBubble
                  }
                >
                  {message.isLoading ? (
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    message.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < message.content.split("\n").length - 1 && <br />}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className={styles.chatFooter}>
          <input
            ref={inputRef}
            type="text"
            className={styles.chatInput}
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={styles.chatSend}
            onClick={sendMessage}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 채팅창 열렸을 때 배경 오버레이 (모바일) */}
      {isChatOpen && <div className={styles.overlay} onClick={toggleChat} />}
    </>
  );
}
