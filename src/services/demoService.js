const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* =========================
   AUTH HELPERS
========================= */

function getToken() {
  return sessionStorage.getItem("northlight-token");
}

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

/* =========================
   HELPERS
========================= */

function getFollowUpDate(lead) {
  if (!lead?.followUps || lead.followUps.length === 0) {
    return "";
  }

  const activeFollowUp =
    lead.followUps.find((item) => !item.completed) ||
    lead.followUps[0];

  if (!activeFollowUp?.date) {
    return "";
  }

  return new Date(activeFollowUp.date)
    .toISOString()
    .split("T")[0];
}

function mapLead(lead) {
  return {
    ...lead,
    id: lead._id || lead.id,
    followUpDate: getFollowUpDate(lead),
  };
}

/* =========================
   SERVICE
========================= */

const demoService = {
  /* =========================
     AUTHENTICATION
  ========================= */

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    sessionStorage.setItem("northlight-token", data.token);

    sessionStorage.setItem(
      "northlight-admin",
      JSON.stringify(data.admin),
    );

    sessionStorage.setItem("northlight-auth", "true");

    return data;
  },

  logout() {
    sessionStorage.removeItem("northlight-token");
    sessionStorage.removeItem("northlight-admin");
    sessionStorage.removeItem("northlight-auth");
  },

  isAuthenticated() {
    return Boolean(getToken());
  },

  /* =========================
     GET LEADS
  ========================= */

  async list() {
    const response = await fetch(`${API_URL}/leads`, {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch leads",
      );
    }

    return (data.leads || []).map(mapLead);
  },

  /* =========================
     GET SINGLE LEAD
  ========================= */

  async get(id) {
    const response = await fetch(`${API_URL}/leads/${id}`, {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch lead",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     CREATE LEAD
     PUBLIC
  ========================= */

  async create(lead) {
    const payload = {
      ...lead,

      followUps: lead.followUpDate
        ? [
            {
              date: lead.followUpDate,
              note: "",
              completed: false,
            },
          ]
        : [],
    };

    delete payload.followUpDate;
    delete payload.id;
    delete payload._id;

    const response = await fetch(`${API_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to create lead",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     UPDATE LEAD
  ========================= */

  async update(id, changes) {
    const payload = {
      ...changes,
    };

    delete payload.id;
    delete payload._id;

    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        "followUpDate",
      )
    ) {
      payload.followUps = changes.followUpDate
        ? [
            {
              date: changes.followUpDate,
              note: "",
              completed: false,
            },
          ]
        : [];

      delete payload.followUpDate;
    }

    const response = await fetch(
      `${API_URL}/leads/${id}`,
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update lead",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     DELETE LEAD
  ========================= */

  async remove(id) {
    const response = await fetch(
      `${API_URL}/leads/${id}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete lead",
      );
    }

    return true;
  },

  /* =========================
     ADD NOTE
  ========================= */

  async addNote(id, text) {
    const response = await fetch(
      `${API_URL}/leads/${id}/notes`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          text,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add note",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     DELETE NOTE
  ========================= */

  async removeNote(id, noteId) {
    const response = await fetch(
      `${API_URL}/leads/${id}/notes/${noteId}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete note",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     ADD FOLLOW-UP
  ========================= */

  async addFollowUp(id, followUp) {
    const response = await fetch(
      `${API_URL}/leads/${id}/followups`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(followUp),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add follow-up",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     UPDATE FOLLOW-UP
  ========================= */

  async updateFollowUp(
    id,
    followUpId,
    changes,
  ) {
    const response = await fetch(
      `${API_URL}/leads/${id}/followups/${followUpId}`,
      {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(changes),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update follow-up",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     DELETE FOLLOW-UP
  ========================= */

  async removeFollowUp(id, followUpId) {
    const response = await fetch(
      `${API_URL}/leads/${id}/followups/${followUpId}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to delete follow-up",
      );
    }

    return mapLead(data.lead);
  },

  /* =========================
     NOTIFICATIONS
  ========================= */

  notifications() {
    return [];
  },

  markNotification() {
    return true;
  },

  markAllNotifications() {
    return true;
  },
};

export default demoService;