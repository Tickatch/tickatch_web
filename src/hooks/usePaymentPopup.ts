"use client";

import { useCallback, useEffect, useRef } from "react";

interface PaymentSuccessData {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface PaymentFailData {
  code: string;
  message: string;
  orderId?: string;
}

interface UsePaymentPopupOptions {
  onSuccess: (data: PaymentSuccessData) => void;
  onFail: (data: PaymentFailData) => void;
  onCancel?: () => void;
}

const PAYMENT_CHANNEL = "payment_channel";

// 모듈 레벨에서 싱글톤으로 관리
let globalChannel: BroadcastChannel | null = null;
let globalMessageHandler: ((event: MessageEvent) => void) | null = null;

function getOrCreateChannel(): BroadcastChannel {
  if (!globalChannel || globalChannel.name !== PAYMENT_CHANNEL) {
    globalChannel = new BroadcastChannel(PAYMENT_CHANNEL);
    console.log("[usePaymentPopup] 글로벌 BroadcastChannel 생성");
  }
  return globalChannel;
}

export function usePaymentPopup({
                                  onSuccess,
                                  onFail,
                                  onCancel,
                                }: UsePaymentPopupOptions) {
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  const onSuccessRef = useRef(onSuccess);
  const onFailRef = useRef(onFail);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onFailRef.current = onFail;
    onCancelRef.current = onCancel;
  }, [onSuccess, onFail, onCancel]);

  const cleanup = useCallback(() => {
    console.log("[usePaymentPopup] cleanup");
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    popupRef.current = null;
  }, []);

  // 메시지 핸들러 등록
  useEffect(() => {
    const channel = getOrCreateChannel();

    const handleMessage = (event: MessageEvent) => {
      console.log("[usePaymentPopup] 메시지 수신:", event.data);
      const { type, data, error } = event.data || {};

      if (type === "PAYMENT_SUCCESS" && data) {
        console.log("[usePaymentPopup] PAYMENT_SUCCESS 처리");
        isProcessingRef.current = true;

        // ACK 전송
        channel.postMessage({ type: "PAYMENT_ACK" });

        onSuccessRef.current(data as PaymentSuccessData);
        cleanup();
      } else if (type === "PAYMENT_FAIL") {
        console.log("[usePaymentPopup] PAYMENT_FAIL 처리");
        isProcessingRef.current = true;

        channel.postMessage({ type: "PAYMENT_ACK" });

        onFailRef.current(
            (error as PaymentFailData) || { code: "UNKNOWN", message: "결제에 실패했습니다." }
        );
        cleanup();
      }
    };

    // 이전 핸들러 제거 후 새 핸들러 등록
    if (globalMessageHandler) {
      channel.removeEventListener("message", globalMessageHandler);
    }
    globalMessageHandler = handleMessage;
    channel.addEventListener("message", handleMessage);

    console.log("[usePaymentPopup] 메시지 핸들러 등록됨");

    return () => {
      // 언마운트 시 핸들러만 제거 (채널은 유지)
      if (globalMessageHandler) {
        channel.removeEventListener("message", globalMessageHandler);
        globalMessageHandler = null;
      }
      cleanup();
    };
  }, [cleanup]);

  const openPaymentPopup = useCallback((checkoutUrl: string) => {
    console.log("[usePaymentPopup] 팝업 열기");

    // 이전 팝업/인터벌 정리
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    isProcessingRef.current = false;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    popupRef.current = window.open(
        checkoutUrl,
        "payment_popup",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popupRef.current) {
      onFailRef.current({
        code: "POPUP_BLOCKED",
        message: "팝업이 차단되었습니다. 팝업 차단을 해제해주세요.",
      });
      return;
    }

    // 팝업 닫힘 감지
    checkIntervalRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        console.log("[usePaymentPopup] 팝업 닫힘 감지, isProcessing:", isProcessingRef.current);

        clearInterval(checkIntervalRef.current!);
        checkIntervalRef.current = null;

        if (!isProcessingRef.current) {
          if (onCancelRef.current) {
            onCancelRef.current();
          } else {
            onFailRef.current({
              code: "USER_CANCEL",
              message: "결제를 취소하셨습니다.",
            });
          }
        }
        popupRef.current = null;
      }
    }, 500);
  }, []);

  return { openPaymentPopup, closePopup: cleanup };
}