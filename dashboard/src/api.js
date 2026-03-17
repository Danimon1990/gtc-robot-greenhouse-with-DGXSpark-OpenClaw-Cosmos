const BASE = "http://localhost:8000";

export const getSensors = () =>
  fetch(`${BASE}/api/sensors`).then((r) => r.json());

export const updateSensors = (body) =>
  fetch(`${BASE}/api/sensors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const setFan = (power) =>
  fetch(`${BASE}/api/actuators/fan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ power }),
  }).then((r) => r.json());

export const setDoor = (open) =>
  fetch(`${BASE}/api/actuators/door`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ open }),
  }).then((r) => r.json());

export const runAgent = (imageBlob, actuate = false) => {
  const form = new FormData();
  form.append("image", imageBlob, "frame.jpg");
  form.append("actuate", actuate.toString());
  return fetch(`${BASE}/api/agent/run`, { method: "POST", body: form }).then(
    (r) => r.json()
  );
};

export const getRecentRuns = (limit = 10) =>
  fetch(`${BASE}/api/history/runs?limit=${limit}`).then((r) => r.json());

export const getZoneHistory = (zoneId, hours = 24) =>
  fetch(`${BASE}/api/history/zones?zone_id=${zoneId}&hours=${hours}`).then(
    (r) => r.json()
  );
