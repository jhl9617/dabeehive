import "./globals.css";

export const metadata = {
  title: "Dabeehive 오케스트레이터",
  description: "AI 에이전트 오케스트레이터 PoC"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
