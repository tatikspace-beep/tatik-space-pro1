const COOKIE_NAME = "app_session_id";

module.exports = async (req, res) => {
  if (req.url === "/api/health") {
    return res.status(200).json({ ok: true, cookie: COOKIE_NAME });
  }
  
  res.status(404).json({ error: "Not found" });
};
