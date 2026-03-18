export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="fade-in-fast">
      {children}
    </div>
  );
}