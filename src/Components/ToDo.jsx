import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from 'antd';

const SHEET_URL = "https://v1.nocodeapi.com/olcayyyy/google_sheets/NicEiAjSosFTguYX?tabId=Sheet1";

const ToDo = () => {
  const [catchVal, setCatchVal] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(SHEET_URL);
      const rows = res.data.data;
      const tasks = rows.map((row, index) => ({
        id: index,
        task: row.task,
        status: row.status,
      }));
      setTaskList(tasks);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  const addOrUpdateTask = async (e) => {
    e.preventDefault();
    if (!catchVal.trim()) {
      alert("Görev girin!");
      return;
    }

    if (isEdit) {
      try {
        await axios.put(`${SHEET_URL}&row_id=${editRowIndex + 2}`, {
          row_id: editRowIndex + 2,
          task: catchVal,
          status: taskList[editRowIndex].status,
        });
        fetchTodos();
        setIsEdit(false);
        setEditRowIndex(null);
      } catch (error) {
        console.error("Güncelleme hatası:", error);
      }
    } else {
      try {
        await axios.post(SHEET_URL, [
          [catchVal, "pending"]
        ]);
        fetchTodos();
      } catch (error) {
        console.error("Ekleme hatası:", error);
      }
    }

    setCatchVal("");
  };

  const deleteTask = async (index) => {
    const rowNumber = index + 2;
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      try {
        const deleteUrl = `${SHEET_URL}&row_id=${rowNumber}`;
        await axios.delete(deleteUrl);
        fetchTodos();
      } catch (error) {
        console.error("Silme hatası:", error.response ? error.response.data : error.message);
      }
    }
  };

  const editTask = (index) => {
    setIsEdit(true);
    setCatchVal(taskList[index].task);
    setEditRowIndex(index);
  };

  const toggleStatus = async (index) => {
    const current = taskList[index];
    const newStatus = current.status === "pending" ? "complete" : "pending";
    const rowNumber = index + 2;

    try {
      await axios.put(`${SHEET_URL}&row_id=${rowNumber}`, {
        row_id: rowNumber,
        task: current.task,
        status: newStatus,
      });
      fetchTodos();
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
    }
  };

  const filteredList = taskList
    .filter((item) => {
      if (filter === "complete") return item.status === "complete";
      if (filter === "pending") return item.status === "pending";
      return true;
    })
    .filter((item) =>
      item.task.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="container">
      <h1 className="todo-title">ToDoList</h1>

      <form onSubmit={addOrUpdateTask}>
        <input
          type="text"
          value={catchVal}
          onChange={(e) => setCatchVal(e.target.value)}
        />
        <Button type="primary" htmlType="submit">
          {isEdit ? "Güncelle" : "Ekle"}
        </Button>
      </form>

      <input
        type="text"
        placeholder="Görev ara..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: "10px", marginBottom: "10px", padding: "5px", width: "200px" }}
      />

      <div className="comPen">
        <button onClick={() => setFilter("all")}>Tümü</button>
        <button onClick={() => setFilter("complete")}>Tamamlanan</button>
        <button onClick={() => setFilter("pending")}>Bekleyen</button>
      </div>

      <div className="todosContainer">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <div className="tasks" key={index}>
              <input
                type="checkbox"
                checked={item.status === "complete"}
                onChange={() => toggleStatus(index)}
              />
              <div className='todo'>
                <span
                  style={{
                    textDecoration:
                      item.status === "complete" ? "line-through" : "none",
                  }}
                >
                  {item.task}
                </span>
                <div className="btn">
                  <Button type="default" onClick={() => editTask(index)}>
                    Düzenle
                  </Button>
                  <button className="delete" onClick={() => deleteTask(index)}>Sil</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Görev yok</p>
        )}
      </div>
    </div>
  );
};

export default ToDo;
