import { useEffect, useRef, useState } from "react";
import axios from "axios";

import TaskCommentItem from "./TaskCommentItem";
import TaskCommentInput from "./TaskCommentInput";
import { getProjectSocket } from "../../socket/projectSocket";

const API = "http://localhost:5000/api";

function TaskComments({ task }) {
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!task) return;

    loadComments();
  }, [task]);

  useEffect(() => {
    const socket = getProjectSocket();

    if (!socket) return;

    socket.on(
      "task_comment_added",
      (comment) => {
        if (
          comment.task === task._id ||
          comment.task?._id === task._id
        ) {
          setComments((prev) => [
            ...prev,
            comment,
          ]);
        }
      }
    );

    return () =>
      socket.off("task_comment_added");
  }, [task]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [comments]);

  async function loadComments() {
    const res = await axios.get(
      `${API}/task-comments/${task._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments(res.data.comments);
  }

  return (
    <div className="mt-8">

      <h3 className="mb-5 text-lg font-semibold">
        Discussion
      </h3>

      <div className="space-y-4">

        {comments.map((comment) => (
          <TaskCommentItem
            key={comment._id}
            comment={comment}
          />
        ))}

        <div ref={bottomRef} />

      </div>

      <TaskCommentInput
        task={task}
        onAdded={loadComments}
      />

    </div>
  );
}

export default TaskComments;