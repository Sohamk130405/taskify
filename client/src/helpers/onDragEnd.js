import axios from "axios";

export const onDragEnd = async (result, columns, setColumns) => {
  if (!result.destination) return;

  const { source, destination } = result;

  if (source.droppableId !== destination.droppableId) {
    // Handling drag between different columns
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1); // Remove item from source
    destItems.splice(destination.index, 0, removed); // Insert item into destination

    // Update state
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });

    try {
      // Update backend for both source and destination columns
      await axios.put(`/api/boards/tasks/move`, {
        sourceCardId: source.droppableId,
        destinationCardId: destination.droppableId,
        items: destItems.map((task, index) => ({
          id: task.id,
          position: index,
        })),
      });
    } catch (error) {
      console.error("Failed to update tasks", error);
    }
  } else {
    // Handling drag within the same column
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1); // Remove item from original position
    copiedItems.splice(destination.index, 0, removed); // Insert item at new position
    console.log(copiedItems);
    // Update state
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });

    try {
      // Update the backend for the new order within the same column
      await axios.put(`/api/boards/tasks/move`, {
        sourceCardId: source.droppableId,
        destinationCardId: destination.droppableId,
        items: copiedItems.map((task, index) => ({
          id: task.id,
          position: index,
        })),
      });
    } catch (error) {
      console.error("Failed to update tasks", error);
    }
  }
};
