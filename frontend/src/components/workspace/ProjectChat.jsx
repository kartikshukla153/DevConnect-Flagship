import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";
import { getProjectSocket } from "../../socket/projectSocket";

const API = "http://localhost:5000/api/project-chat";

function ProjectChat({ projectId }) {
  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const socket = getProjectSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "new_project_message",
      (message) => {
        setMessages((prev) => [
          ...prev,
          message,
        ]);
      }
    );

    socket.on(
      "project_typing",
      ({ user }) => {
        setTypingUser(user);

        clearTimeout(
          window.projectTypingTimer
        );

        window.projectTypingTimer =
          setTimeout(() => {
            setTypingUser("");
          }, 1500);
      }
    );

    socket.on(
      "project_stop_typing",
      () => {
        setTypingUser("");
      }
    );

    return () => {
      socket.off("new_project_message");
      socket.off("project_typing");
      socket.off("project_stop_typing");
    };
  }, [socket]);

  async function loadMessages() {
    try {
      const res = await axios.get(
        `${API}/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(res.data.messages || []);
    } catch (err) {
      console.log(err);
    }
  }

  async function sendMessage() {
    if (!text.trim()) return;

    try {
      setSending(true);

      await axios.post(
        `${API}/${projectId}`,
        {
          message: text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket?.emit(
        "project_stop_typing",
        projectId
      );

      setText("");
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
    }
  }

  function handleTyping(e) {
    setText(e.target.value);

    socket?.emit("project_typing", {
      projectId,
      user: user.name,
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#263243] bg-[#111827]">

      <div className="border-b border-[#263243] px-6 py-5">

        <h2 className="font-semibold text-white">
          Workspace Chat
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Real-time collaboration
        </p>

      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">

        {messages.map((msg) => {
          const mine =
            msg.sender?._id === user?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${
                mine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  mine
                    ? "bg-cyan-400 text-black"
                    : "border border-[#263243] bg-[#0B1220]"
                }`}
              >
                {!mine && (
                  <div className="mb-2 text-xs font-semibold text-cyan-400">
                    {msg.sender?.name}
                  </div>
                )}

                <p className="leading-6">
                  {msg.message}
                </p>

                <div
                  className={`mt-2 text-[10px] ${
                    mine
                      ? "text-black/60"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {typingUser && (
          <div className="text-xs italic text-cyan-400">
            {typingUser} is typing...
          </div>
        )}

        <div ref={bottomRef} />

      </div>

      <div className="border-t border-[#263243] p-4">

        <div className="flex gap-3">

          <input
            value={text}
            onChange={handleTyping}
            onBlur={() =>
              socket?.emit(
                "project_stop_typing",
                projectId
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                sendMessage();
            }}
            placeholder="Message your team..."
            className="flex-1 rounded-xl border border-[#263243] bg-[#0B1220] px-4 py-3 outline-none transition focus:border-cyan-400"
          />

          <button
            disabled={sending}
            onClick={sendMessage}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400 text-black transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {sending ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Send size={18} />
            )}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProjectChat;