import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC IDENTITY
    // =========================

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    // =========================
    // DEVELOPER PROFILE
    // =========================

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          return skills.length <= 50;
        },
        message: "A maximum of 50 skills is allowed",
      },
    },

    github: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "GitHub URL is too long"],
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "LinkedIn URL is too long"],
    },

    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
    },

    experience: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Experience cannot exceed 2000 characters"],
    },

    profilePicture: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Profile picture URL is too long"],
    },

    // =========================
    // ONLINE PRESENCE
    // =========================

    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // =========================
    // CONNECTIONS
    // =========================

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    connectionRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

userSchema.index({
  name: "text",
  bio: "text",
  skills: "text",
  location: "text",
});

// =========================
// NORMALIZE SKILLS
// =========================

userSchema.pre("save", function (next) {
  if (Array.isArray(this.skills)) {
    this.skills = [
      ...new Set(
        this.skills
          .map((skill) => String(skill).trim())
          .filter(Boolean)
      ),
    ];
  }

  next();
});

export default mongoose.model("User", userSchema);