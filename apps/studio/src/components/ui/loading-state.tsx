export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-[#00f0ff]/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-t-[#00f0ff] rounded-full animate-spin" />
      </div>
      <p className="text-[#a1a1aa] text-sm animate-pulse">{message}</p>
    </div>
  );
}
