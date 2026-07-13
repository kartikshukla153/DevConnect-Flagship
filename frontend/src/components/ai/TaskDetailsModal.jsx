import axios from "axios";

const API = "http://localhost:5000/api";

export default function TaskDetailsModal({
  task,
  onClose,
  refreshWorkspace,
}) {
  if (!task) return null;

  const token = localStorage.getItem("token");

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#161b22] w-[700px] rounded-xl p-8">

        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">
            {task.title}
          </h2>

          <button onClick={onClose}>✕</button>
        </div>

        <p className="mt-6 text-gray-400">
          {task.description}
        </p>

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div>
            <p>Status</p>
            <p>{task.status}</p>
          </div>

          <div>
            <p>Priority</p>
            <p>{task.priority}</p>
          </div>

          <div>
            <p>Difficulty</p>
            <p>{task.difficulty}</p>
          </div>

          <div>
            <p>Hours</p>
            <p>{task.estimatedHours}</p>
          </div>

        </div>

        <div className="mt-8">
          <h3>Acceptance Criteria</h3>

          <ul className="list-disc pl-5 mt-3">
            {task.acceptanceCriteria?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 mt-10">

          <button
            onClick={() => updateStatus("todo")}
            className="bg-gray-700 px-5 py-2 rounded"
          >
            Todo
          </button>

          <button
            onClick={() => updateStatus("in-progress")}
            className="bg-blue-600 px-5 py-2 rounded"
          >
            In Progress
          </button>

          <button
            onClick={() => updateStatus("completed")}
            className="bg-green-600 px-5 py-2 rounded"
          >
            Done
          </button>

        </div>

      </div>
    </div>
  );
}