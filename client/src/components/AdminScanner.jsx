import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";

const AdminScanner = () => {
  const webcamRef = useRef(null);
  const [scanResult, setScanResult] = useState("");
  const [status, setStatus] = useState("");
  const [remainingScans, setRemainingScans] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);

  const captureAndScan = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        if (qrCode) {
          setScanResult(qrCode.data);
          handleScan(qrCode.data);
        }
      };
    }
  };

  const handleScan = async (data) => {
    try {
      const response = await fetch("https://qr-auth-kwvfmo55c-alphaomega4348s-projects.vercel.app/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeData: data }),
      });
      const result = await response.json();

      setStatus(result.status);

      if (result.status === "success") {
        // If successful, update remaining scans and days
        setRemainingScans(result.remainingScans || null);
        setRemainingDays(result.remainingDays || null);
      } else if (result.status === "limit_reached") {
        setRemainingScans(0); // No scans left
        setRemainingDays(0); // 0 days left
      }
    } catch (error) {
      console.error("Error while scanning:", error);
      setStatus("Error while scanning");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndScan();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Admin QR Code Scanner</h1>
      <Webcam ref={webcamRef} screenshotFormat="image/png" />
      <p>Scan Result: {scanResult}</p>
      <p>Status: {status}</p>
      {remainingScans !== null && <p>Remaining Scans: {remainingScans}</p>}
      {remainingDays !== null && <p>Days Left: {remainingDays}</p>}
    </div>
  );
};

export default AdminScanner;
