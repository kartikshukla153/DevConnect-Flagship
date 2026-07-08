import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
    },

    location: {
      type: String,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    current: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },

    headline: {
      type: String,
    },

    bio: {
      type: String,
    },

    skills: [
      {
        type: String,
      },
    ],

    socialLinks: {
      github: String,
      linkedin: String,
      portfolio: String,
      twitter: String,
    },

    avatar: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    location: {
      type: String,
    },

    availability: {
      type: String,
      enum: [
        "Open to Work",
        "Hiring",
        "Freelancing",
        "Not Available",
      ],
      default: "Open to Work",
    },

    experience: [experienceSchema],
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;