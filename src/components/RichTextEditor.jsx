import { useEffect, useRef } from "react";
import api from "../api/client";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  const internalChange = useRef(false);

  // Sync external value into the editor without breaking cursor position
  useEffect(() => {
    if (!ref.current) return;
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    if (value !== undefined && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    ref.current?.focus();
    // Use setTimeout to let selection stabilize before command
    setTimeout(() => {
      document.execCommand(cmd, false, val);
      handleInput();
    }, 0);
  };

  const handleInput = () => {
    internalChange.current = true;
    const html = ref.current?.innerHTML || "";
    onChange(html);
  };

  const handleLink = () => {
    const url = prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  const handleImageInsert = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("files", file);
    try {
      const res = await api.post("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploaded = res.data?.files?.[0];
      if (uploaded?.url) {
        ref.current?.focus();
        document.execCommand("insertImage", false, uploaded.url);
        handleInput();
      }
    } catch (err) {
      // surface minimal feedback
      alert(err?.response?.data?.message || "Image upload failed");
    } finally {
      // reset input so same file can be chosen again
      e.target.value = "";
    }
  };

  return (
    <div className="rich-editor border rounded p-2" style={{ minHeight: 140 }}>
      <div className="d-flex gap-2 mb-2 flex-wrap">
        <button type="button" className="btn btn-light btn-sm" onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" className="btn btn-light btn-sm" onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" className="btn btn-light btn-sm" onClick={() => exec("underline")}><u>U</u></button>
        <button type="button" className="btn btn-light btn-sm" onClick={() => exec("insertUnorderedList")}>• List</button>
        <button type="button" className="btn btn-light btn-sm" onClick={handleLink}>Link</button>
        <button type="button" className="btn btn-light btn-sm" onClick={handleImageInsert}>Image</button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="d-none"
          onChange={handleImageUpload}
        />
      </div>

      <div
        ref={ref}
        contentEditable
        className="form-control border-0 p-0"
        style={{ minHeight: 100, outline: "none", boxShadow: "none" }}
        onInput={handleInput}
        suppressContentEditableWarning
      />

      <div className="text-muted small mt-1">{placeholder}</div>
    </div>
  );
}
