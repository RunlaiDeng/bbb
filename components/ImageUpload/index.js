import { useState } from "react";
import { nanoid } from "nanoid";
import { useEffect } from "react";

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = await uploadFile(file);

        props?.callback(imageUrl);
        setImage(reader.result);
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
        className="flex flex-col items-center justify-center w-full h-48  rounded-lg border-2 border-dashed border-gray-700 cursor-pointer hover:border-green-500"
      >
        {!image && (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-green-500 mb-4"
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
            <p className="text-sm text-gray-400">JPEG/PNG/WEBP/GIF</p>
            <p className="text-sm text-gray-400">Less than 4MB</p>
          </div>
        )}
        {image && (
          <img
            src={image}
            alt="Uploaded Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        )}
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
    </div>
  );
}
