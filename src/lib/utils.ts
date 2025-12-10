/**
 * className 병합 유틸리티
 * 여러 줄로 작성된 Tailwind 클래스를 안전하게 합침
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
