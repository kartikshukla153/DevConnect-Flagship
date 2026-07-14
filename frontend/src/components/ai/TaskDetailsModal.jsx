import { useState } from "react";
import axios from "axios";
import CodeGeneratorModal from "./CodeGeneratorModal";

const API = "http://localhost:5000/api";

export default function TaskDetailsModal({
  task,
  onClose,
  refreshWorkspace,
}) {
  if (!task) return null;

  const token = localStorage.getItem("token");

  const [showCode, setShowCode] = useState(false);

  const updateStatus = async (status) => {
    try {
      await axios.put(
        `${API}/tasks/status/${task._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onClose();

      if (refreshWorkspace) {
        await refreshWorkspace();
      }
    } catch (err) {
      console.log(err);
      alert("Failed");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-[#161b22] w-[700px] rounded-xl p-8">

          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-white">
              {task.title}
            </h2>

            <button onClick={onClose}>✕</button>
          </div>

          <p className="mt-6 text-gray-400">
            {task.description}
          </p>

          <div className="grid grid-cols-2 gap-5 mt-8">

            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-white">{task.status}</p>
            </div>

            <div>
              <p className="text-gray-400">Priority</p>
              <p className="text-white">{task.priority}</p>
            </div>

            <div>
              <p className="text-gray-400">Difficulty</p>
              <p className="text-white">{task.difficulty}</p>
            </div>

            <div>
              <p className="text-gray-400">Hours</p>
              <p className="text-white">
                {task.estimatedHours}
              </p>
            </div>

          </div>

          <div className="mt-8">
            <h3 className="text-white font-semibold">
              Acceptance Criteria
            </h3>

            <ul className="list-disc pl-5 mt-3 text-gray-300">
              {task.acceptanceCriteria?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 mt-10">

            <button
              onClick={() => setShowCode(true)}
              className="bg-purple-700 hover:bg-purple-800 px-5 py-2 rounded"
            >
              🤖 Generate Starter Code
            </button>

            <button
              onClick={() => updateStatus("todo")}
              className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded"
            >
              Todo
            </button>

            <button
              onClick={() => updateStatus("in-progress")}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded"
            >
              In Progress
            </button>

            <button
              onClick={() => updateStatus("completed")}
              className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded"
            >
              Done
            </button>

          </div>

        </div>
      </div>

      {showCode && (
        <CodeGeneratorModal
          task={task}
          onClose={() => setShowCode(false)}
        />
      )}
    </>
  );
}