function DropOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-cyan-400 bg-cyan-500/10 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-6xl">📂</div>

        <h2 className="mt-4 text-2xl font-bold text-cyan-300">
          Drop files here
        </h2>

        <p className="mt-2 text-gray-300">
          Images, PDFs, Videos, Audio & Documents
        </p>
      </div>
    </div>
  );
}

export default DropOverlay;