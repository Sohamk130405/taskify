import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateBoardModal from "../components/CreateBoardModal";
import { useRecoilValue } from "recoil";
import axios from "axios";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";

const Boards = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const { orgId } = useParams();
  const currUser = useRecoilValue(userAtom);
  const showToast = useShowToast();

  const handleBoardClick = (boardId) => {
    navigate(`/Boards/${orgId}/${boardId}`);
  };

  const handleCreateBoard = async (formData, preview) => {
    try {
      formData.append("created_by", currUser.id);
      const response = await axios.post(
        `/api/organizations/${orgId}/boards/createBoard`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        // Immediately add the new board to the state with the preview image
        setBoards([
          ...boards,
          { ...response.data.board, img: preview, id: response.data.insertId },
        ]);
        console.log("Board created successfully:", response.data.message);
      } else {
        console.log("Failed to create board:", response.data);
      }
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        if (orgId) {
          const response = await axios.get(
            `/api/organizations/${orgId}/boards`
          );
          setBoards(response.data);
        } else {
          showToast("No Organization", "Create or join organization first");
          return navigate("/Home");
        }
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };
    fetchBoards();
  }, [orgId]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 py-10">
      <div className="flex flex-wrap items-center justify-center gap-10">
        {boards.map((board) => {
          const imgUrl = board.img.includes("uploads")
            ? axios.defaults.baseURL + board.img
            : board.img;
          return (
            <div
              key={board.id}
              onClick={() => handleBoardClick(board.id)}
              className="cursor-pointer w-[300px] h-[300px] bg-white rounded-lg shadow-sm text-center text-[#555] font-medium text-[20px] flex flex-col items-center justify-center overflow-hidden"
            >
              <img
                src={imgUrl} // Use the preview image URL if the board was just created
                alt={board.name}
                className="w-full h-2/3 object-cover rounded-lg"
              />
              <div className="mt-3">{board.name}</div>
            </div>
          );
        })}

        <div className="cursor-pointer w-[300px] h-[300px] bg-gray-100 rounded-lg shadow-sm text-center text-[#555] font-medium text-[20px] flex flex-col items-center justify-center">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Create Board
          </button>
        </div>
      </div>

      <CreateBoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
};

export default Boards;
