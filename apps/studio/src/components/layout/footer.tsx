export function Footer() {
  return (
    <footer className="border-t border-white/[0.12] bg-[#0A1929] py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <p className="text-[#64748B] text-sm">
          © {new Date().getFullYear()} Raino Studio. Agentic PCB Design Platform.
        </p>
        <p className="text-[#64748B] text-xs">
          Powered by AI
        </p>
      </div>
    </footer>
  );
}
