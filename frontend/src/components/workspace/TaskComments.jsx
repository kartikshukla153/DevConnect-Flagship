import { MessageSquare } from "lucide-react";

function TaskComments({ comments = [] }) {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

      <div className="mb-5 flex items-center gap-3">

        <MessageSquare
          size={20}
          className="text-cyan-400"
        />

        <h2 className="text-lg font-semibold">
          Comments
        </h2>

      </div>

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#263243] p-8 text-center text-sm text-gray-500">
          No comments yet.
        </div>
      ) : (
        <div className="space-y-5">

          {comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-2xl bg-[#0B1220] p-4"
            >

              <div className="mb-2 flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">

                  {comment.user?.name?.charAt(0)}

                </div>

                <div>

                  <p className="font-medium">

                    {comment.user?.name}

                  </p>

                  <p className="text-xs text-gray-500">

                    {new Date(
                      comment.createdAt
                    ).toLocaleString()}

                  </p>

                </div>

              </div>

              <p className="text-sm leading-6 text-gray-300">

                {comment.text}

              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default TaskComments;