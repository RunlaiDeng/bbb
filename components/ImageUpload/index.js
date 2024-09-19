import { useState } from "react";

export default function ImageUpload() {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
