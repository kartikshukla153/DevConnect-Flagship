import axios from "axios";

function SuggestedDeveloperCard({
  developer,
  onConversationCreated,
}) {
  const token = localStorage.getItem("token");

  const createConversation = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/conversations/${developer._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onConversationCreated(res.data.conversation);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-[#1f2937]">

      <div>
        <h3 className="font-semibold">
          {developer.name}
        </h3>

        <p className="text-sm text-gray-400">
          {developer.email}
        </p>
      </div>

      <button
        onClick={createConversation}
        className="px-4 py-2 rounded bg-cyan-500 text-black font-semibold"
      >
        Message
      </button>

    </div>
  );
}

export default SuggestedDeveloperCard;