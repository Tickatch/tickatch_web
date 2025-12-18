"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
                                         value,
                                         onChange,
                                         placeholder = "내용을 입력하세요...",
                                         className,
                                       }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [fontSize, setFontSize] = useState("3");
  const [isDragOver, setIsDragOver] = useState(false);

  // IME 조합 중인지 추적
  const isComposingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // 초기값 설정 (한 번만)
  useEffect(() => {
    if (editorRef.current && !isInitializedRef.current && value) {
      editorRef.current.innerHTML = value;
      isInitializedRef.current = true;
    }
  }, [value]);

  // 에디터 내용 변경 핸들러
  const handleInput = useCallback(() => {
    // IME 조합 중에는 상태 업데이트 안 함
    if (isComposingRef.current) return;

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // IME 조합 시작
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  // IME 조합 완료
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    // 조합 완료 후 상태 업데이트
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // 툴바 명령 실행
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // 커서 위치에 HTML 삽입
  const insertHtmlAtCursor = useCallback((html: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // 선택 영역이 없으면 끝에 추가
      editor.innerHTML += html;
    } else {
      const range = selection.getRangeAt(0);

      // 에디터 내부인지 확인
      if (editor.contains(range.commonAncestorContainer)) {
        range.deleteContents();

        const fragment = range.createContextualFragment(html);
        range.insertNode(fragment);

        // 커서를 삽입된 내용 뒤로 이동
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // 에디터 외부면 끝에 추가
        editor.innerHTML += html;
      }
    }

    handleInput();
  }, [handleInput]);

  // 파일 업로드
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/file/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.url || data.data?.streamUrl || null;
      }
      return null;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  // 파일 처리 (이미지 또는 동영상)
  const handleFileInsert = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("이미지 또는 동영상 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsUploading(true);
    const url = await uploadFile(file);
    setIsUploading(false);

    if (url) {
      if (isImage) {
        const img = `<img src="${url}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; display: block; border-radius: 8px;" />`;
        insertHtmlAtCursor(img);
      } else if (isVideo) {
        const video = `<div style="margin: 10px 0;"><video controls style="max-width: 100%; border-radius: 8px;"><source src="${url}" type="${file.type}" />동영상을 재생할 수 없습니다.</video></div>`;
        insertHtmlAtCursor(video);
      }
    } else {
      alert("파일 업로드에 실패했습니다.");
    }
  };

  // 이미지 삽입 (버튼 클릭)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    await handleFileInsert(file);
    e.target.value = "";
  };

  // 동영상 삽입 (버튼 클릭)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("동영상 파일만 업로드할 수 있습니다.");
      return;
    }

    await handleFileInsert(file);
    e.target.value = "";
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        await handleFileInsert(file);
      }
    }
  };

  // 붙여넣기 핸들러 (이미지 붙여넣기 지원)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleFileInsert(file);
        }
        return;
      }
    }
    // 이미지가 아니면 기본 붙여넣기 동작
  };

  // 링크 삽입
  const insertLink = () => {
    if (linkUrl) {
      if (linkText) {
        const link = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: underline;">${linkText}</a>`;
        insertHtmlAtCursor(link);
      } else {
        execCommand("createLink", linkUrl);
      }
      setShowLinkModal(false);
      setLinkUrl("");
      setLinkText("");
    }
  };

  // 글자 크기 변경
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    execCommand("fontSize", size);
  };

  // 글자 색상 변경
  const handleTextColor = (color: string) => {
    execCommand("foreColor", color);
  };

  // 배경 색상 변경
  const handleBgColor = (color: string) => {
    execCommand("hiliteColor", color);
  };

  return (
      <div className={cn("border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden", className)}>
        {/* 툴바 */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {/* 글자 크기 */}
          <select
              value={fontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200"
              title="글자 크기"
          >
            <option value="1">아주 작게</option>
            <option value="2">작게</option>
            <option value="3">보통</option>
            <option value="4">크게</option>
            <option value="5">아주 크게</option>
            <option value="6">매우 크게</option>
            <option value="7">최대</option>
          </select>

          {/* 헤딩 */}
          <select
              onChange={(e) => {
                if (e.target.value) {
                  execCommand("formatBlock", e.target.value);
                }
                e.target.value = "";
              }}
              className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200"
              defaultValue=""
              title="단락 스타일"
          >
            <option value="">본문</option>
            <option value="h1">제목 1</option>
            <option value="h2">제목 2</option>
            <option value="h3">제목 3</option>
          </select>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 텍스트 스타일 */}
          <button
              type="button"
              onClick={() => execCommand("bold")}
              title="굵게 (Ctrl+B)"
              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            B
          </button>
          <button
              type="button"
              onClick={() => execCommand("italic")}
              title="기울임 (Ctrl+I)"
              className="w-8 h-8 flex items-center justify-center text-sm italic text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            I
          </button>
          <button
              type="button"
              onClick={() => execCommand("underline")}
              title="밑줄 (Ctrl+U)"
              className="w-8 h-8 flex items-center justify-center text-sm underline text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            U
          </button>
          <button
              type="button"
              onClick={() => execCommand("strikeThrough")}
              title="취소선"
              className="w-8 h-8 flex items-center justify-center text-sm line-through text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            S
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 글자 색상 */}
          <div className="relative group">
            <button
                type="button"
                title="글자 색상"
                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <span className="text-sm font-bold">A</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-500 rounded-sm" />
            </button>
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:grid grid-cols-5 gap-1 z-10">
              {["#000000", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#ffffff"].map((color) => (
                  <button
                      key={color}
                      type="button"
                      onClick={() => handleTextColor(color)}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                  />
              ))}
            </div>
          </div>

          {/* 배경 색상 */}
          <div className="relative group">
            <button
                type="button"
                title="배경 색상"
                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:grid grid-cols-5 gap-1 z-10">
              {["transparent", "#fef2f2", "#fff7ed", "#fefce8", "#f0fdf4", "#eff6ff", "#f5f3ff", "#fdf2f8", "#f3f4f6", "#ffff00"].map((color) => (
                  <button
                      key={color}
                      type="button"
                      onClick={() => handleBgColor(color)}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color === "transparent" ? "white" : color }}
                  >
                    {color === "transparent" && <span className="text-xs text-red-500">✕</span>}
                  </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 정렬 */}
          <button
              type="button"
              onClick={() => execCommand("justifyLeft")}
              title="왼쪽 정렬"
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>
          <button
              type="button"
              onClick={() => execCommand("justifyCenter")}
              title="가운데 정렬"
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
            </svg>
          </button>
          <button
              type="button"
              onClick={() => execCommand("justifyRight")}
              title="오른쪽 정렬"
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 리스트 */}
          <button
              type="button"
              onClick={() => execCommand("insertUnorderedList")}
              title="글머리 기호"
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
              type="button"
              onClick={() => execCommand("insertOrderedList")}
              title="번호 매기기"
              className="w-8 h-8 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            1.
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 링크 */}
          <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              title="링크 삽입"
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          {/* 이미지 */}
          <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="이미지 삽입"
              disabled={isUploading}
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
          />

          {/* 동영상 */}
          <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              title="동영상 삽입"
              disabled={isUploading}
              className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
          />

          {/* 업로드 인디케이터 */}
          {isUploading && (
              <div className="flex items-center gap-2 ml-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                업로드 중...
              </div>
          )}
        </div>

        {/* 에디터 영역 */}
        <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            className={cn(
                "min-h-[300px] p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none transition-colors",
                isDragOver && "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-500"
            )}
            style={{
              minHeight: "300px",
              direction: "ltr",
              textAlign: "left",
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning
        />

        {/* 드래그 오버레이 */}
        {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg">
                파일을 여기에 놓으세요
              </div>
            </div>
        )}

        {/* 링크 모달 */}
        {showLinkModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  링크 삽입
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      링크 텍스트 (선택)
                    </label>
                    <input
                        type="text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        placeholder="표시할 텍스트"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL
                    </label>
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                      type="button"
                      onClick={() => {
                        setShowLinkModal(false);
                        setLinkUrl("");
                        setLinkText("");
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400"
                  >
                    취소
                  </button>
                  <button
                      type="button"
                      onClick={insertLink}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    삽입
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* 하단 안내 */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          이미지/동영상을 드래그하여 놓거나, Ctrl+V로 붙여넣기 할 수 있습니다.
        </div>

        {/* placeholder 스타일 */}
        <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
      </div>
  );
}