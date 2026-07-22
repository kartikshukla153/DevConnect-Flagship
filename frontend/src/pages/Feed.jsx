import { useEffect, useState } from "react";
import axios from "axios";

import FeedStats from "../components/feed/FeedStats";
import PostComposer from "../components/feed/PostComposer";
import FeedPostCard from "../components/feed/FeedPostCard";
import FeedRightSidebar from "../components/feed/FeedRightSidebar";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});

  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/posts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts(res.data.posts || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (content) => {
    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const likePost = async (postId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/posts/like/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async (postId) => {
    try {
      const text = commentText[postId];

      if (!text?.trim()) return;

      await axios.post(
        `http://localhost:5000/api/posts/comment/${postId}`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCommentText((prev) => ({
        ...prev,
        [postId]: "",
      }));

      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-8">
      <FeedStats />

      <div className="grid grid-cols-12 gap-8">
        {/* Feed */}

        <div className="col-span-12 xl:col-span-8 space-y-8">
          <PostComposer
            onCreatePost={createPost}
          />

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#111827] py-24 text-center">
              <h3 className="text-2xl font-bold text-white">
                No posts yet
              </h3>

              <p className="mt-3 text-slate-400">
                Be the first developer to share what you're building.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <FeedPostCard
                key={post._id}
                post={post}
                likePost={likePost}
                commentText={commentText}
                setCommentText={setCommentText}
                addComment={addComment}
              />
            ))
          )}
        </div>

        {/* Sidebar */}

        <div className="hidden xl:col-span-4 xl:block">
          <div className="sticky top-24">
            <FeedRightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;