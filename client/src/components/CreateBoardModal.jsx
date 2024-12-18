import React, { useState } from "react";

const CreateBoardModal = ({ isOpen, onClose, onCreate }) => {
  const [boardName, setBoardName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleCreate = () => {
    if (boardName.trim()) {
      const formData = new FormData();
      formData.append("name", boardName.trim());
      if (image) {
        formData.append("img", image);
      }
      onCreate(formData,preview);
      setBoardName("");
      setImage(null);
      setPreview(null);
      onClose();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Create Board</h2>
        <input
          type="text"
          placeholder="Board Name"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full mb-4"
        />
        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;
