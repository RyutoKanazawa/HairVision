import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../App";
import "../styles/SalonMenu.css";

export const SalonMenu = () => {
  const { auth } = useContext(AuthContext);
  const [menuItems, setMenuItems] = useState([]);
  const [newMenu, setNewMenu] = useState({
    name: "",
    duration: 30, // Default to 30 minutes
    price: "",
  });

  // メニューを取得
  const fetchMenu = async () => {
    try {
      const salonId = auth?.salonId || localStorage.getItem("salonId"); // ログインしているサロンIDを取得
      console.log("Debug: Sending request for salon ID:", salonId);

      if (!salonId) {
        console.error("Debug: No salon ID found in auth context or localStorage.");
        return;
      }

      const response = await axios.get(`http://localhost:5004/salon/menu/${salonId}`, {
        headers: { Authorization: `Bearer ${auth.token || localStorage.getItem("token")}` }, // 認証トークンを追加
      });

      console.log("Debug: Fetched menu items:", response.data);
      setMenuItems(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.warn("No menu items found for this salon.");
        setMenuItems([]); // メニューがない場合、空配列を設定
      } else {
        console.error("Error fetching menu:", err.response?.data || err.message);
      }
    }
  };

  // メニューを追加
  const handleAddMenuItem = async () => {
    try {
      const salonId = auth?.salonId || localStorage.getItem("salonId");
      if (!salonId) {
        console.error("Debug: Cannot add menu item, salon ID is missing.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5004/salon/menu",
        { salon_id: salonId, ...newMenu },
        {
          headers: {
            Authorization: `Bearer ${auth.token || localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Debug: Menu item added:", response.data);
      setMenuItems([...menuItems, response.data]);
      setNewMenu({ name: "", duration: 30, price: "" }); // 入力フォームをリセット
    } catch (err) {
      console.error("Error adding menu item:", err.response?.data || err.message);
    }
  };

  // メニューを削除
  const handleDeleteMenuItem = async (id) => {
    try {
      console.log("Debug: Sending DELETE request for menu item ID:", id);

      const response = await axios.delete(`http://localhost:5004/salon/menu/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token || localStorage.getItem("token")}`,
        },
      });

      console.log("Debug: DELETE response:", response.data);
      setMenuItems(menuItems.filter((item) => item.id !== id)); // ローカル状態を更新
    } catch (err) {
      console.error("Error deleting menu item:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [auth]); // `auth` が変更されたときに再取得

  return (
    <div className="salon-menu">
      <h1>Salon Menu</h1>

      <div className="menu-container">
        {menuItems.map((item) => (
          <div className="menu-item" key={item.id}>
            <span className="menu-name">{item.name}</span>
            <span className="menu-duration">
              {item.duration >= 60
                ? `${Math.floor(item.duration / 60)} hour${
                    item.duration % 60 > 0 ? " 30 minutes" : ""
                  }`
                : `${item.duration} minutes`}
            </span>
            <span className="menu-price">RM {item.price}</span>
            <button
              className="delete-button"
              onClick={() => handleDeleteMenuItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="add-menu-item">
        <h3>Add New Menu Item</h3>
        <input
          type="text"
          placeholder="Menu Name"
          value={newMenu.name}
          onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
        />
        <select
          value={newMenu.duration}
          onChange={(e) => setNewMenu({ ...newMenu, duration: parseInt(e.target.value, 10) })}
        >
          {[30, 60, 90, 120, 150, 180].map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes === 30
                ? "30 minutes"
                : `${Math.floor(minutes / 60)} hour${minutes % 60 > 0 ? " 30 minutes" : ""}`}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Price (RM)"
          value={newMenu.price}
          onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
        />
        <button className="add-button" onClick={handleAddMenuItem}>
          Add
        </button>
      </div>
    </div>
  );
};