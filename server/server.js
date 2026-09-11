const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Lead = require("./models/Lead");
const Admin = require("./models/Admin");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "northlight_crm_secret_2026";

/* =========================
   AUTH MIDDLEWARE
========================= */

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/* =========================
   BASIC ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Northlight CRM API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server and database API are healthy",
  });
});

/* =========================
   ADMIN AUTH
========================= */

/*
  Create the first admin account.

  This works only when no admin account exists.
  After the first admin is created, this endpoint
  cannot create another account.
*/

app.post("/api/auth/setup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
      name: name || "Administrator",
    });

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create admin account",
    });
  }
});

/*
  Admin login
*/

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

/*
  Check logged-in admin
*/

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get admin information",
    });
  }
});

/* =========================
   PUBLIC LEAD INTAKE
========================= */

/*
  IMPORTANT:
  This route stays PUBLIC because
  website visitors need to submit leads.
*/

app.post("/api/leads", async (req, res) => {
  try {
    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to create lead",
      error: error.message,
    });
  }
});

/* =========================
   PROTECTED LEAD ROUTES
========================= */

/*
  Get all leads
*/

app.get("/api/leads", authMiddleware, async (req, res) => {
  try {
    const leads = await Lead.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      leads,
    });
  } catch (error) {
    console.error("Get leads error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
});

/*
  Get single lead
*/

app.get("/api/leads/:id", authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
    });
  }
});

/*
  Update lead
*/

app.put("/api/leads/:id", authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    res.status(400).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
});

/*
  Delete lead
*/

app.delete("/api/leads/:id", authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete lead",
    });
  }
});

/* =========================
   NOTES
========================= */

/*
  Add note
*/

app.post(
  "/api/leads/:id/notes",
  authMiddleware,
  async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: "Note text is required",
        });
      }

      const lead = await Lead.findById(req.params.id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      lead.notes.push({
        text: text.trim(),
      });

      await lead.save();

      res.json({
        success: true,
        message: "Note added successfully",
        lead,
      });
    } catch (error) {
      console.error("Add note error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to add note",
      });
    }
  },
);

/*
  Delete note
*/

app.delete(
  "/api/leads/:id/notes/:noteId",
  authMiddleware,
  async (req, res) => {
    try {
      const lead = await Lead.findById(req.params.id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      lead.notes = lead.notes.filter(
        (note) => note._id.toString() !== req.params.noteId,
      );

      await lead.save();

      res.json({
        success: true,
        message: "Note deleted successfully",
        lead,
      });
    } catch (error) {
      console.error("Delete note error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete note",
      });
    }
  },
);

/* =========================
   FOLLOW UPS
========================= */

/*
  Add follow-up
*/

app.post(
  "/api/leads/:id/followups",
  authMiddleware,
  async (req, res) => {
    try {
      const { date, note } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Follow-up date is required",
        });
      }

      const lead = await Lead.findById(req.params.id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      lead.followUps.push({
        date,
        note: note || "",
        completed: false,
      });

      await lead.save();

      res.json({
        success: true,
        message: "Follow-up added successfully",
        lead,
      });
    } catch (error) {
      console.error("Add follow-up error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to add follow-up",
      });
    }
  },
);

/*
  Update follow-up
*/

app.put(
  "/api/leads/:id/followups/:followUpId",
  authMiddleware,
  async (req, res) => {
    try {
      const lead = await Lead.findById(req.params.id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      const followUp = lead.followUps.id(req.params.followUpId);

      if (!followUp) {
        return res.status(404).json({
          success: false,
          message: "Follow-up not found",
        });
      }

      if (req.body.date !== undefined) {
        followUp.date = req.body.date;
      }

      if (req.body.note !== undefined) {
        followUp.note = req.body.note;
      }

      if (req.body.completed !== undefined) {
        followUp.completed = req.body.completed;
      }

      await lead.save();

      res.json({
        success: true,
        message: "Follow-up updated successfully",
        lead,
      });
    } catch (error) {
      console.error("Update follow-up error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update follow-up",
      });
    }
  },
);

/*
  Delete follow-up
*/

app.delete(
  "/api/leads/:id/followups/:followUpId",
  authMiddleware,
  async (req, res) => {
    try {
      const lead = await Lead.findById(req.params.id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      const followUp = lead.followUps.id(req.params.followUpId);

      if (!followUp) {
        return res.status(404).json({
          success: false,
          message: "Follow-up not found",
        });
      }

      followUp.deleteOne();

      await lead.save();

      res.json({
        success: true,
        message: "Follow-up deleted successfully",
        lead,
      });
    } catch (error) {
      console.error("Delete follow-up error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete follow-up",
      });
    }
  },
);

/* =========================
   DATABASE CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Northlight CRM API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });