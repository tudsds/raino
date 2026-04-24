export function Footer() {
  return (
    <footer className="border-t border-[#27273a] bg-[#0a0a0f] py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <p className="text-[#71717a] text-sm">
          © {new Date().getFullYear()} Raino Studio. Agentic PCB Design Platform.
        </p>
        <p className="text-[#71717a] text-xs">
          Powered by AI
        </p>
      </div>
    </footer>
  );
}
