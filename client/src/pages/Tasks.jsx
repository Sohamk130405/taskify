// pages/Tasks.js
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState, useEffect } from "react";
import { onDragEnd } from "../helpers/onDragEnd";
import { AddOutline } from "react-ionicons";
import AddModal from "../components/AddModal";
import Task from "../components/Task";
import axios from "axios";

const Tasks = () => {
  const { boardId } = useParams();
  const [columns, setColumns] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [position, setPosition] = useState(0);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/boards/${boardId}/tasks`);
        setColumns(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [boardId]);

  const openModal = (columnId, index, task = null) => {
    setSelectedColumn(columnId);
    setEditingTask(task);
    setPosition(index >= 0 ? index + 1 : 0);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleAddTask = (taskData) => {
    const newTasks = { ...columns };
    if (!newTasks[selectedColumn]) {
      newTasks[selectedColumn] = { name: selectedColumn, items: [] };
    }

    if (editingTask) {
      const taskIndex = newTasks[selectedColumn].items.findIndex(
        (t) => t.id === editingTask.id
      );
      newTasks[selectedColumn].items[taskIndex] = { ...taskData };
    } else {
      newTasks[selectedColumn].items.push(taskData);
    }
    setColumns(newTasks);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/boards/${taskId}/tasks`);
      const newTasks = { ...columns };
      Object.keys(newTasks).forEach((columnId) => {
        newTasks[columnId].items = newTasks[columnId].items.filter(
          (task) => task.id !== taskId
        );
      });
      setColumns(newTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <DragDropContext
      onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
    >
      <div className="w-full flex items-start justify-between px-5 pb-8 md:gap-0 gap-10">
        {Object.entries(columns).map(([columnId, column]) => (
          <div className="w-full flex flex-col gap-0" key={columnId}>
            <Droppable droppableId={columnId} key={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col md:w-[290px] w-[250px] gap-3 items-center py-5"
                >
                  <div className="flex items-center justify-center py-[10px] w-full bg-white rounded-lg shadow-sm text-[#555] font-medium text-[15px]">
                    {column.name}
                  </div>
                  {column.items.length > 0 ? (
                    column.items.map((task, index) => (
                      <Draggable
                        key={task.id.toString()}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <Task
                            provided={provided}
                            task={task}
                            onEdit={() => openModal(columnId, index, task)}
                            onDelete={handleDeleteTask}
                          />
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      No tasks available
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <div
              onClick={() => openModal(columnId, column.length - 1)}
              className="flex cursor-pointer items-center justify-center gap-1 py-[10px] md:w-[90%] lg:w-[50%] w-full opacity-90 bg-white rounded-lg shadow-sm text-[#555] font-medium text-[15px]"
            >
              <AddOutline color={"#555"} />
              Add Task
            </div>
          </div>
        ))}
      </div>
      <AddModal
        isOpen={modalOpen}
        onClose={closeModal}
        setOpen={setModalOpen}
        handleAddTask={handleAddTask}
        cardId={selectedColumn}
        position={position}
        editingTask={editingTask}
      />
    </DragDropContext>
  );
};

export default Tasks;
