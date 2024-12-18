/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Task.js
import axios from "axios";
import { TimeOutline } from "react-ionicons";

import { PencilOutline, TrashOutline } from "react-ionicons";

const Task = ({ task, provided, onEdit, onDelete }) => {
  const { title, description, priority, due_date, img, tags, assigned_to } =
    task;
  const formattedDate = new Date(due_date).toLocaleDateString();

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="w-full cursor-grab bg-[#fff] flex flex-col justify-between gap-3 items-start shadow-sm rounded-xl px-3 py-4"
    >
      {img && (
        <img
          src={axios.defaults.baseURL + img}
          alt="task_img"
          className="w-full h-[170px] rounded-lg"
        />
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag.title}
            className="px-[10px] py-[2px] text-[13px] font-medium rounded-md"
            style={{ backgroundColor: tag.bg_color, color: tag.text_color }}
          >
            {tag.title}
          </span>
        ))}
      </div>
      <div className="w-full flex items-start flex-col gap-0">
        <span className="text-[15.5px] font-medium text-[#555]">{title}</span>
        <span className="text-[13.5px] text-gray-500">{description}</span>
      </div>

      <div className="w-full border border-dashed"></div>
      <div
        key={assigned_to.id}
        className="cursor-pointer hover:bg-gray-100 p-2 rounded"
      >
        <div className="flex gap-2">
          <img
            src={
              assigned_to.profile_pic
                ? axios.defaults.baseURL + assigned_to.profile_pic
                : "/images/user.png"
            }
            alt="prifile_pic"
            className="h-10 w-10 object-cover rounded-full"
          />
          <div className="flex flex-col">
            <p className="text-sm">Assigned To</p>
            <h6 className="font-medium">{assigned_to.name}</h6>{" "}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <TimeOutline color={"#666"} width="19px" height="19px" />
          <span className="text-[13px] text-gray-700">{formattedDate}</span>
        </div>
        <div
          className={`w-[60px] rounded-full h-[5px] ${
            priority === "high"
              ? "bg-red-500"
              : priority === "medium"
              ? "bg-orange-500"
              : "bg-blue-500"
          }`}
        ></div>
      </div>

      <div className="w-full flex items-center justify-end gap-3">
        <button onClick={() => onEdit(task)} className="text-blue-500">
          <PencilOutline width="20px" height="20px" />
        </button>
        <button onClick={() => onDelete(task.id)} className="text-red-500">
          <TrashOutline width="20px" height="20px" />
        </button>
      </div>
    </div>
  );
};

export default Task;
