// components/AddCardModal.js
import { useState } from "react";

const AddCardModal = ({ isOpen, onClose, handleAddCard }) => {
  const [cardName, setCardName] = useState("");
  console.log("Modal isOpen:", isOpen); // Debug log
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddCard({ name: cardName });
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add New Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Card Name</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddCardModal;
