import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, AlertCircle, Sparkles, Download } from "lucide-react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { renderMakeup } from "@/lib/makeupRenderer";

// Fix #5 — version fixe au lieu de @latest
const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";
const MEDIAPIPE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

interface MakeupConfig {
  lipColor: string;
  eyeshadowColor: string;
  blushColor: string;
  skinTone: string;
  style: string;
}

interface FaceScanStepProps {
  makeupConfig: MakeupConfig;
  onScanComplete: (capturedImageBase64: string) => void;
}

const FaceScanStep = ({ makeupConfig, onScanComplete }: FaceScanStepProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  // Fix #3 — compteur d'erreurs pour éviter les crashes silencieux en boucle
  const detectionErrorCountRef = useRef<number>(0);

  const [status, setStatus] = useState<"loading" | "ready" | "scanning" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [captured, setCaptured] = useState(false);

  const capturePhoto = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCaptured(true);
    setTimeout(() => setCaptured(false), 800);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `makeup-look-${Date.now()}.png`;
      a.click();
      // cleanup immédiat après le click
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, "image/png");
  }, []);

  // Fix #4 — onScanComplete stabilisé via ref pour éviter les dépendances cycliques
  const onScanCompleteRef = useRef(onScanComplete);
  useEffect(() => {
    onScanCompleteRef.current = onScanComplete;
  }, [onScanComplete]);

  const handleScanComplete = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Downscale to max 1024px on the longest side and encode as JPEG
    // to keep payload well under the edge function's 5MB limit.
    const MAX_DIM = 1024;
    const scale = Math.min(1, MAX_DIM / Math.max(canvas.width, canvas.height));
    const targetW = Math.round(canvas.width * scale);
    const targetH = Math.round(canvas.height * scale);

    const out = document.createElement("canvas");
    out.width = targetW;
    out.height = targetH;
    const octx = out.getContext("2d");
    if (!octx) return;
    octx.drawImage(canvas, 0, 0, targetW, targetH);
    const base64 = out.toDataURL("image/jpeg", 0.85);
    onScanCompleteRef.current(base64);
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        if (!cancelled) {
          faceLandmarkerRef.current = landmarker;
          setStatus("ready");
        }
      } catch (err) {
        console.error("MediaPipe init error:", err);
        if (!cancelled) {
          setErrorMsg("Failed to load face detection model");
          setStatus("error");
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      faceLandmarkerRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const drawMakeup = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      landmarks: { x: number; y: number; z: number }[],
      w: number,
      h: number
    ) => {
      renderMakeup(ctx, landmarks, w, h, makeupConfig);
    },
    [makeupConfig]
  );

  // Fix #3 — détection d'erreurs avec compteur pour éviter les boucles silencieuses
  const startDetection = useCallback(() => {
    let progressCounter = 0;
    detectionErrorCountRef.current = 0;

    const detect = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = faceLandmarkerRef.current;

      if (!video || !canvas || !landmarker || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror the canvas to match selfie view
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      try {
        const result = landmarker.detectForVideo(video, performance.now());

        // Reset error counter si la détection réussit
        detectionErrorCountRef.current = 0;

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          setFaceDetected(true);
          progressCounter++;
          setScanProgress(Math.min(progressCounter / 60, 1)); // ~2 secondes à 30fps

          // Mirror landmarks for selfie view
          const mirroredLandmarks = result.faceLandmarks[0].map((l) => ({
            x: 1 - l.x,
            y: l.y,
            z: l.z,
          }));

          drawMakeup(ctx, mirroredLandmarks, canvas.width, canvas.height);
        } else {
          setFaceDetected(false);
        }
      } catch (err) {
        // Fix #3 — compteur d'erreurs : arrêt après 10 erreurs consécutives
        detectionErrorCountRef.current += 1;
        console.warn("Detection error #" + detectionErrorCountRef.current, err);

        if (detectionErrorCountRef.current > 10) {
          setStatus("error");
          setErrorMsg("Face detection encountered an issue. Please try again.");
          return; // arrêt de la boucle rAF
        }
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [drawMakeup]);

  // Fix #1 — startCamera dépend de startDetection
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus("scanning");
        startDetection();
      }
    } catch {
      setErrorMsg("Camera access denied. Please allow camera permissions.");
      setStatus("error");
    }
  }, [startDetection]); // Fix #1 — startDetection ajouté dans les deps

  return (
    <div className="space-y-5">
      {/* Camera viewport */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-border aspect-[3/4] max-h-[60vh]">
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Loader2 size={24} className="text-gold animate-spin" />
            </div>
            <p className="font-body text-sm text-muted-foreground">Loading face detection…</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 z-10">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle size={24} className="text-destructive" />
            </div>
            <p className="font-body text-sm text-muted-foreground text-center">{errorMsg}</p>
            {/* Bouton retry pour une meilleure UX en cas d'erreur */}
            <button
              onClick={() => {
                setStatus("loading");
                setErrorMsg("");
                detectionErrorCountRef.current = 0;
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-muted text-foreground font-body text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
            <motion.button
              onClick={startCamera}
              className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center shadow-lg"
              whileTap={{ scale: 0.95 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Camera size={32} className="text-foreground" />
            </motion.button>
            <p className="font-display text-sm font-medium text-foreground">Tap to start camera</p>
            <p className="font-body text-xs text-muted-foreground">Position your face in the frame</p>
          </div>
        )}

        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Face guide overlay */}
        {status === "scanning" && (
          <>
            {/* Oval face guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-52 h-72 rounded-[50%] border-2 transition-colors duration-500 ${
                  faceDetected ? "border-gold/60" : "border-muted-foreground/30"
                }`}
              />
            </div>

            {/* Status badge */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-4 py-1.5 rounded-full backdrop-blur-md font-body text-xs flex items-center gap-2 ${
                  faceDetected
                    ? "bg-card/80 text-gold border border-gold/30"
                    : "bg-card/80 text-muted-foreground border border-border"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    faceDetected ? "bg-gold animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {faceDetected ? "Applying makeup…" : "Looking for face…"}
              </motion.div>
            </div>

            {/* Scan progress */}
            {faceDetected && scanProgress < 1 && (
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className="h-full gradient-gold"
                    initial={{ width: "0%" }}
                    animate={{ width: `${scanProgress * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Capture button */}
            {faceDetected && scanProgress >= 1 && (
              <div className="absolute bottom-4 right-4 z-20">
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center shadow-lg border-2 border-card"
                >
                  <Download size={18} className="text-foreground" />
                </motion.button>
              </div>
            )}

            {/* Flash effect */}
            {captured && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-background z-30 pointer-events-none"
              />
            )}
          </>
        )}
      </div>

      {/* Complete scan button */}
      {status === "scanning" && faceDetected && scanProgress >= 1 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleScanComplete} // Fix #4 — utilise handleScanComplete stable
          className="w-full py-4 rounded-2xl gradient-gold text-foreground font-display text-base font-medium tracking-wide shadow-lg flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles size={18} />
          See My Look
        </motion.button>
      )}

      {/* Makeup being applied info */}
      {status === "scanning" && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: "Lips", color: makeupConfig.lipColor },
            { label: "Eyes", color: makeupConfig.eyeshadowColor },
            { label: "Cheeks", color: makeupConfig.blushColor },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border flex-shrink-0"
            >
              <div
                className="w-4 h-4 rounded-full border border-border/50"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-body text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceScanStep;
