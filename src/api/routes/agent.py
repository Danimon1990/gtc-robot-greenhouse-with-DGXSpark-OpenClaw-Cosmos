import io
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter()

STATE_FILE = "sensor_state.json"


def _extract_middle_frame(video_bytes: bytes) -> bytes:
    """Extract the middle frame from a video file using OpenCV."""
    try:
        import cv2
        import numpy as np

        arr = np.frombuffer(video_bytes, dtype=np.uint8)
        cap = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if cap is None:
            # Try writing to temp file for container formats
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
                f.write(video_bytes)
                tmp_path = f.name
            cap = cv2.VideoCapture(tmp_path)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count // 2)
            ret, frame = cap.read()
            cap.release()
            Path(tmp_path).unlink(missing_ok=True)
        else:
            # It decoded as an image directly — just use it
            frame = cap
            ret = True

        if not ret or frame is None:
            raise ValueError("Could not decode video frame")

        _, buf = cv2.imencode(".jpg", frame)
        return buf.tobytes()
    except ImportError:
        raise HTTPException(status_code=500, detail="opencv-python required for video input")


@router.post("/agent/run")
async def run_agent_endpoint(
    image: UploadFile = File(None),
    actuate: bool = Form(False),
) -> dict:
    """
    Run Cosmos Reason 2 on an uploaded image or video frame.
    Accepts JPEG/PNG images or MP4/AVI video (extracts middle frame).
    """
    if image is None:
        raise HTTPException(status_code=400, detail="No image file provided")

    raw_bytes = await image.read()
    content_type = image.content_type or ""

    if content_type.startswith("video/") or image.filename.endswith((".mp4", ".avi", ".mov")):
        image_bytes = _extract_middle_frame(raw_bytes)
    else:
        image_bytes = raw_bytes

    if not Path(STATE_FILE).exists():
        raise HTTPException(status_code=404, detail="sensor_state.json not found")

    from src.agent.agent import run_agent
    result = run_agent(image_bytes, state_file=STATE_FILE, actuate=actuate)
    return result
