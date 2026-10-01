import React, { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const DownloadPage = ({ rootElementId, downloadFileName }) => {
  const [downloading, setDownloading] = useState(false);

  const downloadFileDocument = async () => {
    const input = document.getElementById(rootElementId);
    if (!input || downloading) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(input, {
        scale: Math.min(2, window.devicePixelRatio || 1),
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const availableWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * availableWidth) / canvas.width;
      const availableHeight = pageHeight - margin * 2;
      const renderHeight = Math.min(imageHeight, availableHeight);

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        margin,
        availableWidth,
        renderHeight,
        undefined,
        "FAST"
      );
      pdf.save(`${downloadFileName}.pdf`);
    } catch (error) {
      console.error("Unable to generate prescription PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      className="prescription-download-button"
      onClick={downloadFileDocument}
      startIcon={<DownloadIcon />}
      disabled={downloading}
    >
      {downloading ? "Preparing..." : "Download"}
    </Button>
  );
};

export default DownloadPage;
