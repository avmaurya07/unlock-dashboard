import api from "./client";

export async function uploadFiles(files) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  return api.post("/api/uploads", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

