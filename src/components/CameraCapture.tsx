"use client";

import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClear?: () => void;
  initialImage?: string | null;
}

export default function CameraCapture({ onCapture, onClear, initialImage }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [showCamera, setShowCamera] = useState(!initialImage);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      onCapture(imageSrc);
      setShowCamera(false);
    }
  };

  const retake = () => {
    setImage(null);
    setShowCamera(true);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-3">
      {showCamera ? (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-md w-full max-w-sm"
            videoConstraints={{ facingMode: "user" }}
          />
          <Button type="button" onClick={capture} className="mt-2 gap-2">
            <Camera className="h-4 w-4" /> Capture Photo
          </Button>
        </div>
      ) : (
        <div>
          {image && <img src={image} alt="Captured" className="h-32 w-32 object-cover rounded-md border" />}
          <Button type="button" variant="outline" onClick={retake} className="mt-2 gap-2">
            <RefreshCw className="h-4 w-4" /> Retake
          </Button>
        </div>
      )}
    </div>
  );
}