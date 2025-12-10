"use client";

import { useCallback, useEffect, useRef } from "react";
import { LoginResponse, ProviderType } from "@/types/auth";
import { getOAuthLoginUrl } from "@/lib/api-client";

interface UseOAuthPopupOptions {
  onSuccess: (response: LoginResponse) => void;
  onError: (error: string) => void;
  onCancel?: () => void; // 팝업 수동 닫힘 시 호출
}

export function useOAuthPopup({
  onSuccess,
  onError,
  onCancel,
}: UseOAuthPopupOptions) {
  const popupRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false); // 성공/에러 처리 중 플래그

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onCancelRef = useRef(onCancel);

  // 최신 콜백 참조 유지
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onCancelRef.current = onCancel;
  }, [onSuccess, onError, onCancel]);

  // 팝업 및 인터벌 정리 함수
  const cleanup = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  }, []);

  // 메시지 수신 핸들러
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 같은 origin에서 온 메시지만 처리
      if (event.origin !== window.location.origin) return;

      const { type, data, error } = event.data || {};

      if (type === "OAUTH_SUCCESS" && data) {
        isProcessingRef.current = true;
        onSuccessRef.current(data as LoginResponse);
        cleanup();
      } else if (type === "OAUTH_ERROR") {
        isProcessingRef.current = true;
        onErrorRef.current(error || "OAuth 인증에 실패했습니다.");
        cleanup();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [cleanup]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 팝업 열기
  const openOAuthPopup = useCallback(
    (provider: ProviderType, rememberMe: boolean = false) => {
      // 기존 팝업 정리
      cleanup();
      isProcessingRef.current = false;

      // 팝업 크기 및 위치 계산
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      // 백엔드 OAuth URL
      const oauthUrl = getOAuthLoginUrl(provider, rememberMe);

      // 팝업 열기
      popupRef.current = window.open(
        oauthUrl,
        "oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popupRef.current) {
        onErrorRef.current("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
        return;
      }

      // 팝업이 수동으로 닫혔는지 확인
      checkIntervalRef.current = setInterval(() => {
        if (popupRef.current?.closed) {
          // 성공/에러 처리 중이 아닐 때만 취소 처리
          if (!isProcessingRef.current) {
            if (onCancelRef.current) {
              onCancelRef.current();
            } else {
              // onCancel이 없으면 onError로 취소 메시지 전달
              onErrorRef.current("로그인을 취소하셨습니다.");
            }
          }
          cleanup();
        }
      }, 500);
    },
    [cleanup]
  );

  return { openOAuthPopup, closePopup: cleanup };
}
