"use client";

import { useEffect, useMemo, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";

type PaymentStatus = "processing" | "success" | "fail";

interface PaymentResult {
  status: PaymentStatus;
  message: string;
}

const PAYMENT_CHANNEL = "payment_channel";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const messageAckedRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const paymentResult = useMemo<PaymentResult>(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const code = searchParams.get("code");
    const errorMessage = searchParams.get("message");

    console.log("[PaymentCallback] paymentResult 계산:", { paymentKey, orderId, amount, code });

    if (paymentKey && orderId && amount) {
      return {
        status: "success",
        message: "결제가 완료되었습니다. 창이 자동으로 닫힙니다.",
      };
    }

    if (code) {
      return {
        status: "fail",
        message: errorMessage || "결제가 취소되었습니다.",
      };
    }

    return {
      status: "fail",
      message: "결제 결과를 확인할 수 없습니다.",
    };
  }, [searchParams]);

  useEffect(() => {
    console.log("[PaymentCallback] useEffect 시작");

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const code = searchParams.get("code");
    const errorMessage = searchParams.get("message");

    console.log("[PaymentCallback] params:", { paymentKey, orderId, amount, code, errorMessage });

    // BroadcastChannel 생성
    try {
      channelRef.current = new BroadcastChannel(PAYMENT_CHANNEL);
      console.log("[PaymentCallback] BroadcastChannel 생성 성공");
    } catch (e) {
      console.error("[PaymentCallback] BroadcastChannel 생성 실패:", e);
      return;
    }

    // ACK 수신 리스너
    channelRef.current.onmessage = (event) => {
      console.log("[PaymentCallback] 메시지 수신:", event.data);
      if (event.data?.type === "PAYMENT_ACK") {
        console.log("[PaymentCallback] ACK 수신 - 창 닫기");
        messageAckedRef.current = true;
        channelRef.current?.close();
        window.close();
      }
    };

    // 결제 성공
    if (paymentKey && orderId && amount) {
      const message = {
        type: "PAYMENT_SUCCESS",
        data: {
          paymentKey,
          orderId,
          amount: Number(amount),
        },
      };
      console.log("[PaymentCallback] 성공 메시지 전송:", message);
      channelRef.current.postMessage(message);

      const timer = setTimeout(() => {
        console.log("[PaymentCallback] 3초 타임아웃 - ACK 수신 여부:", messageAckedRef.current);
        if (!messageAckedRef.current) {
          console.log("[PaymentCallback] ACK 미수신 - 강제 닫기");
          channelRef.current?.close();
          window.close();
        }
      }, 3000);

      return () => {
        clearTimeout(timer);
        channelRef.current?.close();
      };
    }

    // 결제 실패/취소
    if (code) {
      const message = {
        type: "PAYMENT_FAIL",
        error: {
          code: code || "UNKNOWN",
          message: errorMessage || "결제에 실패했습니다.",
          orderId: orderId || undefined,
        },
      };
      console.log("[PaymentCallback] 실패 메시지 전송:", message);
      channelRef.current.postMessage(message);

      const timer = setTimeout(() => {
        console.log("[PaymentCallback] 3초 타임아웃 (실패) - ACK 수신 여부:", messageAckedRef.current);
        if (!messageAckedRef.current) {
          channelRef.current?.close();
          window.close();
        }
      }, 3000);

      return () => {
        clearTimeout(timer);
        channelRef.current?.close();
      };
    }

    // 알 수 없는 상태
    const message = {
      type: "PAYMENT_FAIL",
      error: {
        code: "UNKNOWN",
        message: "결제 결과를 확인할 수 없습니다.",
      },
    };
    console.log("[PaymentCallback] 알 수 없는 상태 메시지 전송:", message);
    channelRef.current.postMessage(message);

    const timer = setTimeout(() => {
      if (!messageAckedRef.current) {
        channelRef.current?.close();
        window.close();
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      channelRef.current?.close();
    };
  }, [searchParams]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
            {paymentResult.status === "success" && (
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg
                      className="w-8 h-8 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
            )}

            {paymentResult.status === "fail" && (
                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                      className="w-8 h-8 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
            )}

            <h1
                className={`text-xl font-bold mb-2 ${
                    paymentResult.status === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                }`}
            >
              {paymentResult.status === "success" ? "결제 완료" : "결제 실패"}
            </h1>

            <p className="text-gray-600 dark:text-gray-400">{paymentResult.message}</p>

            <button
                onClick={() => window.close()}
                className="mt-6 px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              창 닫기
            </button>
          </div>
        </div>
      </div>
  );
}

export default function PaymentCallbackPage() {
  console.log("[PaymentCallbackPage] 렌더링");

  return (
      <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
      >
        <PaymentCallbackContent />
      </Suspense>
  );
}