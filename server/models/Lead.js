const mongoose = require("mongoose");

/* =========================
   NOTE SCHEMA
========================= */

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================
   FOLLOW-UP SCHEMA
========================= */

const followUpSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================
   LEAD SCHEMA
========================= */

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    company: {
      type: String,
      default: "",
      trim: true,
    },

    project: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       PUBLIC FORM FIELDS
    ========================= */

    budget: {
      type: String,
      default: "",
      trim: true,
    },

    preferredContact: {
      type: String,
      enum: ["Email", "Phone"],
      default: "Email",
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    /* =========================
       CRM FIELDS
    ========================= */

    source: {
      type: String,
      enum: [
        "Website",
        "LinkedIn",
        "Referral",
        "Other",
      ],
      default: "Website",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Converted",
      ],
      default: "New",
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
      ],
      default: "Medium",
    },

    /* =========================
       NOTES
    ========================= */

    notes: {
      type: [noteSchema],
      default: [],
    },

    /* =========================
       FOLLOW-UPS
    ========================= */

    followUps: {
      type: [followUpSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "Lead",
  leadSchema,
);