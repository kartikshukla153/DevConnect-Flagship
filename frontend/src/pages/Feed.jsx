import { useEffect, useState } from "react";
import axios from "axios";

import AppLayout from "../layout/AppLayout";

import FeedStats from "../components/feed/FeedStats";
import CreatePostCard from "../components/feed/CreatePostCard";
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
    <AppLayout>

      <FeedStats />

      <div className="grid grid-cols-12 gap-8">

        <div className="col-span-12 xl:col-span-8">

          <CreatePostCard
            onCreatePost={createPost}
          />

          <div className="mt-8">

            {posts.map((post) => (
              <FeedPostCard
                key={post._id}
                post={post}
                likePost={likePost}
                commentText={commentText}
                setCommentText={setCommentText}
                addComment={addComment}
              />
            ))}

          </div>

        </div>

        <div className="hidden xl:block xl:col-span-4">

          <FeedRightSidebar />

        </div>

      </div>

    </AppLayout>
  );
}

export default Feed;