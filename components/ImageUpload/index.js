import { useState } from "react";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import rpc from "@/components/Rpc";
import { useNotification } from "../Context/notice";

const uploadFile = async (file) => {
  const fileName = nanoid() + ".png";
  const url = "https://sg.storage.bunnycdn.com/benybadboy/" + fileName; // Replace 'REGION', 'STORAGE_ZONE_NAME' & 'FILENAME.EXTENSION'
  const accessKey = "47c0be8a-71dd-4860-8c4f26304061-dc39-44f1";

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        AccessKey: accessKey,
        "Content-Type": "application/octet-stream",
        accept: "application/json",
      },
      body: file,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Upload successful:", result);
      return "https://benybadboy.b-cdn.net/" + fileName;
    } else {
      console.error("Upload failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function ImageUpload(props) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const { success, failure } = useNotification();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check if the file size exceeds 4MB (4 * 1024 * 1024 bytes)
      if (file.size > 4 * 1024 * 1024) {
        failure("File size exceeds 4MB. Please upload a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        setLoading(true); // Set loading to true when upload starts
        const imageUrl = await uploadFile(file);

        props?.callback(imageUrl);
        setImage(reader.result);
        setLoading(false); // Set loading to false when upload ends
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setImage("");
  }, [props?.clean]);

  useEffect(() => {
    setImage(props?.image);
  }, [props?.image]);

  return (
    <div className="max-w-sm mx-auto w-full">
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-28 h-28 rounded-lg border-2 border-dashed border-gray-700 cursor-pointer hover:border-green-700 m-auto"
      >
        {loading && ( // Show loading indicator
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin w-12 h-12 text-green-700 mb-4" // Add spin animation
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z"
              />
            </svg>
            <p className="text-xs text-gray-400">Uploading...</p>
          </div>
        )}
        {!loading &&
          !image && ( // Only show this if not loading and no image
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-green-700 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              <p className="text-[8px] text-gray-400">JPEG/PNG/WEBP/GIF</p>
              <p className="text-[8px]  text-gray-400">Less than 4MB</p>
            </div>
          )}
        {image &&
          !loading && ( // Only show the image if not loading
            <img
              src={image}
              alt="Uploaded Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        <input
          id="file-upload"
          type="file"
          accept=".jpeg,.jpg,.png,.webp,.gif"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
    </div>
  );
}
