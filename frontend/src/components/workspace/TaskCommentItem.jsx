function TaskCommentItem({
  comment,
}) {
  return (
    <div className="rounded-2xl border border-[#263243] bg-[#0B1220] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">

          {comment.author?.name?.charAt(0)}

        </div>

        <div>

          <p className="font-semibold">

            {comment.author?.name}

          </p>

          <p className="text-xs text-gray-500">

            {new Date(
              comment.createdAt
            ).toLocaleString()}

          </p>

        </div>

      </div>

      <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-300">

        {comment.content}

      </p>

      {comment.edited && (
        <p className="mt-3 text-xs italic text-gray-500">
          edited
        </p>
      )}

    </div>
  );
}

export default TaskCommentItem;
