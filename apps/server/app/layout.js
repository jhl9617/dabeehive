export const metadata = {
  title: "Dabeehive Orchestrator",
  description: "AI Agent Orchestrator PoC"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
