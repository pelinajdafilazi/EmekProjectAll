import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user'
};

function WebcamCapture({ onCapture, onClose }) {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <div className="webcam-modal" onClick={onClose}>
      <div className="webcam-container" onClick={(e) => e.stopPropagation()}>
        <h3>Fotoğraf Çek</h3>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          width={480}
          height={360}
        />
        <div className="webcam-buttons">
          <button className="btn btn-primary" onClick={capture}>
            Fotoğraf Çek
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebcamCapture;






