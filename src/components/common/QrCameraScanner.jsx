import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, RotateCcw } from "lucide-react";

/**
 * QrCameraScanner
 * Renders a live camera viewfinder and calls `onScan(decodedText)` when a QR code is detected.
 *
 * BUG FIX: The html5-qrcode library injects an error message into its container div when
 * `stop()` is called concurrently from two places (once inside the scan callback, once during
 * React's component cleanup on unmount). The fix is:
 *  1. Stop the scanner FIRST inside the detection callback (await), THEN call onScan.
 *  2. Use `stoppedRef` as a guard so the React cleanup skips stop() if already done.
 * This prevents the library's error message from briefly flashing in the UI.
 */
export default function QrCameraScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const stoppedRef = useRef(false); // guard against double-stop
  const containerId = useRef(`qr-reader-${Math.random().toString(36).slice(2)}`).current;
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);

  const startScanner = async (cameraId) => {
    // Stop any existing scanner instance first
    if (scannerRef.current && !stoppedRef.current) {
      try { await scannerRef.current.stop(); } catch (_) {}
    }
    stoppedRef.current = false;

    const html5QrCode = new Html5Qrcode(containerId);
    scannerRef.current = html5QrCode;
    setStatus("starting");
    setErrorMsg("");

    try {
      await html5QrCode.start(
        cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
        async (decodedText) => {
          // KEY FIX: stop scanner FIRST, THEN call onScan.
          // This prevents html5-qrcode from injecting its own error markup
          // into the container div while React is in the middle of unmounting.
          if (!stoppedRef.current) {
            stoppedRef.current = true;
            try { await html5QrCode.stop(); } catch (_) {}
          }
          setStatus("idle");
          onScan && onScan(decodedText);
        },
        () => {} // per-frame decode failure — ignore silently
      );
      setStatus("running");
    } catch (err) {
      const msg = err?.message || String(err);
      const friendly = msg.includes("ermission")
        ? "Camera permission denied. Please allow camera access in your browser settings."
        : "Could not start camera: " + msg;
      setErrorMsg(friendly);
      setStatus("error");
      onError && onError(friendly);
    }
  };

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          const back = devices.find((d) => /back|rear|environment/i.test(d.label));
          const chosen = back || devices[devices.length - 1];
          setActiveCameraId(chosen.id);
          startScanner(chosen.id);
        } else {
          setErrorMsg("No cameras found on this device.");
          setStatus("error");
        }
      })
      .catch((err) => {
        setErrorMsg("Camera access error: " + (err?.message || err));
        setStatus("error");
      });

    return () => {
      // Only stop if the onScan callback hasn't already stopped it
      if (scannerRef.current && !stoppedRef.current) {
        stoppedRef.current = true;
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
      }
      scannerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = async () => {
    if (cameras.length < 2) return;
    const idx = cameras.findIndex((c) => c.id === activeCameraId);
    const next = cameras[(idx + 1) % cameras.length];
    setActiveCameraId(next.id);
    stoppedRef.current = false;
    await startScanner(next.id);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div
        className="relative w-full rounded-2xl overflow-hidden border-4 border-emerald-500 shadow-xl bg-slate-900"
        style={{ maxWidth: 300, aspectRatio: "1 / 1" }}
      >
        <div id={containerId} className="w-full h-full" />

        {status === "running" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-48 h-48">
              <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              <div
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                style={{
                  boxShadow: "0 0 12px #34d399",
                  animation: "qr-scan 2s linear infinite",
                  top: "50%",
                }}
              />
            </div>
          </div>
        )}

        {status === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80">
            <Camera className="w-10 h-10 text-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-200 font-mono">Starting camera...</span>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900 p-5 text-center">
            <CameraOff className="w-10 h-10 text-rose-400" />
            <span className="text-[11px] text-rose-300 font-medium leading-relaxed">{errorMsg}</span>
            <button
              onClick={() => {
                setStatus("idle");
                setErrorMsg("");
                stoppedRef.current = false;
                startScanner(activeCameraId);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}
      </div>

      {cameras.length > 1 && status === "running" && (
        <button
          onClick={handleSwitchCamera}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Switch Camera
        </button>
      )}

      <style>{`
        @keyframes qr-scan {
          0%   { top: 12%; }
          50%  { top: 88%; }
          100% { top: 12%; }
        }
      `}</style>
    </div>
  );
}
