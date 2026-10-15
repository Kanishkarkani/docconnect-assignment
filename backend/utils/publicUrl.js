// Images are stored as paths like "/images/profile/profile-1.png".
// Turn them into full URLs so the app can load them from this server.
function toPublicUrl(req, path) {
  if (!path || path.startsWith("http")) {
    return path;
  }

  return `${req.protocol}://${req.get("host")}${path}`;
}

module.exports = toPublicUrl;
