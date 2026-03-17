import React, { useRef, useState, useEffect, useCallback } from "react";

const styles = {
  panel: {
    background: "#1a1f2e",
    borderRadius: 8,
    border: "1px solid #2d3748",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    display: "flex",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid #2d3748",
    alignItems: "center",
  },
  tab: (active) => ({
    padding: "4px 12px",
    borderRadius: 4,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    background: active ? "#4a5568" : "transparent",
    color: active ? "#e2e8f0" : "#718096",
  }),
  videoWrap: {
    flex: 1,
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    position: "relative",
  },
  video: { width: "100%", maxHeight: 280, objectFit: "cover" },
  canvas: { display: "none" },
  placeholder: { color: "#4a5568", fontSize: 13 },
  captureBtn: {
    margin: "10px 14px",
    padding: "8px 0",
    width: "calc(100% - 28px)",
    borderRadius: 6,
    border: "none",
    background: "#48bb78",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  fileInput: { display: "none" },
  uploadBtn: {
    margin: "10px 14px",
    padding: "8px 0",
    width: "calc(100% - 28px)",
    borderRadius: 6,
    border: "1px dashed #4a5568",
    background: "transparent",
    color: "#a0aec0",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
};

export default function VideoFeed({ onFrameReady }) {
  const [mode, setMode] = useState("upload"); // "camera" | "upload"
  const [cameraActive, setCameraActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const streamRef = useRef(null);

  // Start/stop camera
  useEffect(() => {
    if (mode !== "camera") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
      })
      .catch(() => setCameraActive(false));
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  const captureFrame = useCallback(() => {
    if (mode === "camera" && videoRef.current && canvasRef.current) {
      const v = videoRef.current;
      const c = canvasRef.current;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext("2d").drawImage(v, 0, 0);
      c.toBlob((blob) => blob && onFrameReady?.(blob), "image/jpeg", 0.85);
    } else if (mode === "upload" && uploadedFile) {
      onFrameReady?.(uploadedFile);
    }
  }, [mode, uploadedFile, onFrameReady]);

  // Expose captureFrame externally via ref — but simpler: just call it from button
  // and let parent pass onFrameReady.

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  return (
    <div style={styles.panel}>
      <div style={styles.toolbar}>
        <span style={{ fontSize: 12, color: "#718096", marginRight: 4 }}>SOURCE:</span>
        <button style={styles.tab(mode === "camera")} onClick={() => setMode("camera")}>
          Webcam
        </button>
        <button style={styles.tab(mode === "upload")} onClick={() => setMode("upload")}>
          File
        </button>
      </div>

      <div style={styles.videoWrap}>
        {mode === "camera" ? (
          cameraActive ? (
            <video ref={videoRef} autoPlay muted playsInline style={styles.video} />
          ) : (
            <span style={styles.placeholder}>Requesting camera…</span>
          )
        ) : uploadedFile ? (
          uploadedFile.type.startsWith("video/") ? (
            <video
              src={URL.createObjectURL(uploadedFile)}
              controls
              style={styles.video}
            />
          ) : (
            <img
              src={URL.createObjectURL(uploadedFile)}
              alt="upload"
              style={styles.video}
            />
          )
        ) : (
          <span style={styles.placeholder}>No file selected</span>
        )}
      </div>

      <canvas ref={canvasRef} style={styles.canvas} />

      {mode === "camera" ? (
        <button style={styles.captureBtn} onClick={captureFrame} disabled={!cameraActive}>
          Capture Frame
        </button>
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            style={styles.fileInput}
            onChange={handleFile}
          />
          <button style={styles.uploadBtn} onClick={() => fileRef.current?.click()}>
            {uploadedFile ? `✓ ${uploadedFile.name}` : "Upload image or video…"}
          </button>
          {uploadedFile && (
            <button style={styles.captureBtn} onClick={captureFrame}>
              Use This Frame
            </button>
          )}
        </>
      )}
    </div>
  );
}
