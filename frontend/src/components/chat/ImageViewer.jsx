function ImageViewer({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed inset-0 z-50
        bg-black/90
        flex items-center justify-center
        p-8
      "
    >
      <img
        src={image}
        alt="preview"
        onClick={(e) => e.stopPropagation()}
        className="
          max-w-full
          max-h-full
          rounded-xl
          shadow-2xl
          animate-fadeIn
        "
      />

      <button
        onClick={onClose}
        className="
          absolute
          top-6
          right-8
          text-white
          text-4xl
          hover:text-red-400
        "
      >
        ×
      </button>
    </div>
  );
}

export default ImageViewer;