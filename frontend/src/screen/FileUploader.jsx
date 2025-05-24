import React, { useState } from "react";
import logo from "../../public/pdf.png";
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

function FileUploader() {
  const [extractedText, setExtractedText] = useState("");
  const [textAI, setTextAI] = useState("");
    const handleCopy = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      alert("Copied to clipboard!"); 
    } catch (err) {
      console.error("Copy failed", err);
    }
  };
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let pageText = "";
      for (const item of content.items) {
        pageText += item.str + " ";
      }
      fullText += pageText + "\n\n";
    }
    setExtractedText(fullText);
   try {
    const aiResult = await handleTextAI(fullText)
  } catch (err) {
    console.error(err)
  }
  };
  const handleTextAI = async (data) => {
    console.log("Extracted Text:", data);  
    if (!data) return;
    const text = "Please read this CV and create a message for my connection in linkedin so that they can give me a referral for the job I am applying for." + data;
    try {
      const response = await fetch("http://localhost:8080/api/textai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
      });
      const responseData = await response.json();
      setTextAI(responseData.text);
    } catch (error) {
      console.error("Error fetching AI text:", error);
    }
  };
  return (
    <div className="flex flex-row">
      <div className="file-uploader w-1/2 h-screen bg-gray-900 flex justify-center items-center">
        <label
          htmlFor="cv-upload"
          className="
      flex flex-col justify-center items-center
      bg-amber-600 text-white
      px-6 py-4
      rounded-lg
      cursor-pointer
      w-fit h-fit
    "
        >
          <span className="text-xl font-semibold mb-2">
            Please upload your CV
          </span>
          <input
            id="cv-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="sr-only"
          />
          <img src={logo} alt="Upload Icon" className="w-12 h-12 mb-2" />
        </label>
      </div>
      <div className="data-shower w-1/2 h-screen bg-zinc-700 flex flex-col justify-center items-center gap-2">
        {extractedText && (
          <div className="mt-6 w-3/4 h-1/2 bg-white p-4 rounded-xl overflow-hidden">
          <div className="flex flex-row justify-between items-center mb-4">
            <div className="extract-text font-bold mb-2 text-2xl w-fit rounded-2xl p-2 border-2 border-rose-800 bg-rose-400">
              Extracted Text:
            </div>
             <img
              src="https://img.icons8.com/ios-filled/50/000000/copy.png"
              alt="Copy Icon"
              className="w-6 h-6 cursor-pointer"
              onClick={handleCopy}
             />
            </div>
            <textarea
              readOnly
              value={extractedText}
              onFocus={(e) => e.target.select()} // auto-select on click
              className="
        flex
        w-full h-3/4
        resize-none
        mx-auto
        bg-gray-100
        text-sm
        whitespace-pre-wrap
        outline-none
        p-2
        rounded-xl
        border-2 border-gray-300
        no-scrollbar
      "
            />
          </div>
        )}
         {textAI && (
          <div className="mt-6 w-3/4 h-1/2 bg-white p-4 rounded-xl overflow-hidden">
          <div className="flex flex-row justify-between items-center mb-4">
            <div className="extract-text font-bold mb-2 text-2xl w-fit rounded-2xl p-2 border-2 border-rose-800 bg-rose-400">
              AI Text:
            </div>
             <img
              src="https://img.icons8.com/ios-filled/50/000000/copy.png"
              alt="Copy Icon"
              className="w-6 h-6 cursor-pointer"
              onClick={handleCopy}
             />
            </div>
            <textarea
              readOnly
              value={textAI}
              onFocus={(e) => e.target.select()} // auto-select on click
              className="
        flex
        w-full h-3/4
        resize-none
        mx-auto
        bg-gray-100
        text-sm
        whitespace-pre-wrap
        outline-none
        p-2
        rounded-xl
        border-2 border-gray-300
        no-scrollbar
      "
            />
          </div>
        )}
         </div>
      </div>
  );
}

export default FileUploader;
