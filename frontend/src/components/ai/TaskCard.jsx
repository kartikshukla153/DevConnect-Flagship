import { useState } from "react";
import TaskDetailsModal from "./TaskDetailsModal";

export default function TaskCard({
  task,
  refreshWorkspace,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-[#161b22] hover:bg-[#1d2430] transition cursor-pointer rounded-xl p-5 border border-[#2b3240] mb-3"
      >
        <h3 className="font-semibold text-white">
          {task.title}
        </h3>

        <p className="text-sm text-gray-400 mt-2">
          {task.status}
        </p>
      </div>

      <TaskDetailsModal
        task={open ? task : null}
        onClose={() => setOpen(false)}
        refreshWorkspace={refreshWorkspace}
      />
    </>
  );
}