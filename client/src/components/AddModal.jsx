// components/AddModal.jsx
import React, { useEffect, useState } from "react";
import { getRandomColors } from "../helpers/getRandomColors";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

const AddModal = ({
  isOpen,
  onClose,
  setOpen,
  handleAddTask,
  cardId,
  position,
  editingTask,
  fetchTasks,
}) => {
  const initialTaskData = {
    id: uuidv4(),
    title: "",
    description: "",
    priority: "",
    due_date: "",
    image: null,
    assigned_to: "",
    alt: "",
    tags: [],
  };
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState(initialTaskData);
  const [tagTitle, setTagTitle] = useState("");
  const { orgId, boardId } = useParams();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]); // State to hold filtered users
  const currUser = useRecoilValue(userAtom);
  useEffect(() => {
    if (editingTask) {
      setTaskData(editingTask); // Pre-fill form for editing
    } else {
      setTaskData(initialTaskData);
    }
  }, [editingTask]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });

    if (name === "assigned_to") {
      setSearchQuery(value);
      // Filter users based on the search query
      if (value) {
        setFilteredUsers(
          users.filter((user) =>
            user.email.toLowerCase().includes(value.toLowerCase())
          )
        );
      } else {
        setFilteredUsers([]);
      }
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTaskData({ ...taskData, image: file });
    }
  };

  const handleAddTag = () => {
    if (tagTitle.trim() !== "") {
      const { bg, text } = getRandomColors();
      const newTag = { title: tagTitle.trim(), bg_color: bg, text_color: text };
      setTaskData({ ...taskData, tags: [...taskData.tags, newTag] });
      setTagTitle("");
    }
  };

  const closeModal = () => {
    setOpen(false);
    onClose();
    setTaskData(initialTaskData);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", taskData.title);
    formData.append("description", taskData.description);
    formData.append("priority", taskData.priority);
    formData.append("due_date", taskData.due_date);
    formData.append("created_by", currUser.id); // Replace with actual user id or username
    formData.append("assigned_to", taskData.assigned_to.id); // Set the assigned user
    formData.append("position", position); // Add logic to handle position if applicable
    formData.append("orgId", orgId);
    formData.append("boardId", boardId);

    if (taskData.image) {
      formData.append("img", taskData.image);
    }

    taskData.tags.forEach((tag, index) => {
      formData.append(`tags[${index}][title]`, tag.title);
      formData.append(`tags[${index}][bg_color]`, tag.bg_color);
      formData.append(`tags[${index}][text_color]`, tag.text_color);
    });

    try {
      if (editingTask) {
        // **Edit Task Logic**
        await axios.put(
          `/api/boards/${editingTask.id}/tasks`, // Use task ID for update
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update the UI with edited task details
        handleAddTask({
          ...editingTask,
          ...taskData,
          img: taskData.image
            ? URL.createObjectURL(taskData.image)
            : editingTask.img,
        });
      } else {
        // **Add Task Logic**
        const response = await axios.post(
          `/api/boards/${cardId}/tasks`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update the UI with the newly added task
        handleAddTask({
          id: response.data.taskId,
          ...taskData,
          img: taskData.image ? URL.createObjectURL(taskData.image) : null,
        });
      }

      // Reset task data and close the modal
      setTaskData(initialTaskData);
      closeModal();
    } catch (error) {
      console.error("Error saving task:", error);
      // Handle the error (e.g., display a notification)
    }
  };

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`/api/users/orgUsers/${orgId}`)
        .then((res) => {
          setUsers(res.data);
          setFilteredUsers(res.data);
        })
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [isOpen, currUser?.id]);

  const handleUserSelect = (user) => {
    setTaskData({ ...taskData, assigned_to: user });
    setFilteredUsers(users);
  };
  const handleRemoveTag = (index) => {
    setTaskData((prevTaskData) => ({
      ...prevTaskData,
      tags: prevTaskData.tags.filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      className={`w-screen h-screen place-items-center fixed top-0 left-0 ${
        isOpen ? "grid" : "hidden"
      }`}
    >
      <div
        className="w-full h-full bg-black opacity-70 absolute left-0 top-0 z-20"
        onClick={closeModal}
      ></div>
      <div className="md:w-[30vw] w-[90%] bg-white rounded-lg shadow-md z-50 flex flex-col items-center gap-3 px-5 py-6">
        <input
          type="text"
          name="title"
          value={taskData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm font-medium"
        />
        <input
          type="text"
          name="description"
          value={taskData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm font-medium"
        />
        <select
          name="priority"
          onChange={handleChange}
          value={taskData.priority}
          className="w-full h-12 px-2 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
        >
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <div className="relative w-full">
          <input
            type="text"
            name="assigned_to"
            value={taskData.assigned_to?.email}
            onChange={handleChange}
            placeholder="Assign To"
            className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm font-medium"
          />
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {filteredUsers.length > 0
              ? filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex gap-2">
                      <img
                        src={
                          user.profile_pic
                            ? axios.defaults.baseURL + user.profile_pic
                            : "/images/user.png"
                        }
                        alt="prifile_pic"
                        className="h-10 w-10 object-cover rounded-full"
                      />
                      <div className="flex flex-col">
                        <h6 className="font-medium">{user.name}</h6>{" "}
                        <p className="text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              : "No users found"}
          </div>
        </div>

        <input
          type="date"
          name="due_date"
          value={taskData.due_date}
          onChange={handleChange}
          placeholder="due_date"
          className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
        />
        <input
          type="text"
          value={tagTitle}
          onChange={(e) => setTagTitle(e.target.value)}
          placeholder="Tag Title"
          className="w-full h-12 px-3 outline-none rounded-md bg-slate-100 border border-slate-300 text-sm"
        />
        <button
          className="w-full rounded-md h-9 bg-slate-500 text-amber-50 font-medium"
          onClick={handleAddTag}
        >
          Add Tag
        </button>
        <div className="w-full">
          {taskData.tags && <span>Tags:</span>}
          {taskData.tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center mx-1 px-[10px] py-[2px] text-[13px] font-medium rounded-md"
              style={{ backgroundColor: tag.bg_color, color: tag.text_color }}
            >
              {tag.title}
              <button
                onClick={() => handleRemoveTag(index)}
                className="ml-2 text-xs text-red-500 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <input
          type="file"
          onChange={handleImageChange}
          className="text-xs font-medium"
        />
        <div className="w-full flex items-center justify-between gap-3">
          <button
            onClick={closeModal}
            className="rounded-md h-9 bg-slate-400 text-slate-800 font-medium px-6"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md h-9 bg-amber-500 text-white font-medium px-6"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
