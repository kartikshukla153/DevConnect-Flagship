function FeedSkeleton() {
  return (
    <div className="space-y-6">

      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-white/10 bg-[#111827] p-6"
        >
          <div className="mb-5 h-5 w-40 rounded bg-gray-700" />

          <div className="mb-3 h-4 rounded bg-gray-700" />

          <div className="mb-3 h-4 w-5/6 rounded bg-gray-700" />

          <div className="h-4 w-3/4 rounded bg-gray-700" />
        </div>
      ))}

    </div>
  );
}

export default FeedSkeleton;