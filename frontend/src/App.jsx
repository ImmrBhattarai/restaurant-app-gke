// src/App.jsx
import React, { useEffect, useState } from "react";
// Import the new external CSS file
import "./App.css"; 

// In a larger project, you'd store this in a config file or env variable.
// Here we hard-code it for simplicity.
const BACKEND_BASE_URL = "";

// LOGO PLACEHOLDER URL (500x500, transparent effect, with text)
const LOGO_URL = "/logo.png";


function App() {
  // We remove the isMobile state and its useEffect, relying on CSS media queries.
  
  // State to store menu items from backend
  const [menuItems, setMenuItems] = useState([]);

  // Form fields for creating an order
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // UI feedback
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [message, setMessage] = useState("");

  // -----------------------------
  // 1. Fetch menu items on load
  // -----------------------------
  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoadingMenu(true);
        setMessage("");

        // Added a delay for demonstration purposes, remove in production
        // await new Promise(resolve => setTimeout(resolve, 500)); 

        const response = await fetch(`/api/menu`);
        if (!response.ok) {
          throw new Error(`Failed to fetch menu. Status: ${response.status}`);
        }

        const data = await response.json();
        setMenuItems(data);

        // Pre-select first item, if any
        if (data.length > 0) {
          setSelectedItemId(String(data[0].id));
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setMessage("Error loading menu. Looks like we encountered a problem running the backend");
      } finally {
        setLoadingMenu(false);
      }
    }

    fetchMenu();
  }, []);

  // -----------------------------
  // 2. Handle order form submit
  // -----------------------------
  async function handleSubmit(event) {
    event.preventDefault();

    if (!customerName || !address || !selectedItemId || !quantity || Number(quantity) < 1) {
      setMessage("Please fill in all fields correctly.");
      return;
    }

    try {
      setSubmittingOrder(true);
      setMessage("");

      const payload = {
        customerName,
        address,
        itemId: Number(selectedItemId),
        quantity: Number(quantity),
      };

      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.error ||
            `Failed to place order. Status: ${response.status}`
        );
      }

      const createdOrder = await response.json();
      console.log("Created order:", createdOrder);
      setMessage(`Order #${createdOrder.id} placed successfully!`);

      // Reset form (keep selected item for convenience)
      setCustomerName("");
      setAddress("");
      setQuantity(1);
    } catch (error) {
      console.error("Error submitting order:", error);
      setMessage(error.message || "Error placing order. Please try again.");
    } finally {
      setSubmittingOrder(false);
    }
  }

  // Helper to determine the CSS class for the message box
  const getMessageClass = () => {
    if (!message) return "";
    if (message.includes("successfully")) return "success";
    if (message.includes("Error") || message.includes("fill in all")) return "error";
    return ""; // Default info message
  };
  
  // -----------------------------
  // New handler for server load button
  // -----------------------------
  const handleViewServerLoad = () => {
    // Navigate to the new page URL /server-load
    window.location.href = "/server-load";
  };
  
  // -----------------------------
  // 3. Render UI
  // -----------------------------

  return (
    <div className="app-container">
      {/* LEFT PANEL: MENU */}
      <div className="menu-panel">
        <header>
          
          <img 
            src={LOGO_URL} 
            alt="Suraj's Kloud Kitchen Logo" 
            className="app-logo"
            // Fallback for image loading error
            onError={(e) => { 
                e.target.onerror = null; 
                e.target.style.display = 'none'; 
                e.target.closest('header').querySelector('h1').style.marginTop = '0';
            }}
          />
          <p>
            Served 🔥, straight from Google Kubernetes Engine!
          </p>
        </header>

        <section>
          <h2 className="section-title">Today's Offerings</h2>
          {loadingMenu ? (
            <p className="feedback-message">Loading menu...</p>
          ) : menuItems.length === 0 ? (
            <p className="feedback-message">No items available at this time.</p>
          ) : (
            <table className="menu-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">
                    Price ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      {item.name}
                    </td>
                    <td className="text-right">
                      {item.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* NEW BUTTON: View Server Load - Placed at the bottom of the menu panel */}
        <button
        // Commenting out onclick because, our initial plan of adding Grafana Visuals and dashboard iframe was pulled back. Now this is just a Versionindicator button.
         // onClick={handleViewServerLoad}
          className="btn-primary"
          // Inline style to ensure full width and proper vertical spacing at the bottom
          style={{ width: '100%', marginTop: '1.5rem', boxShadow: 'none' }} 
        >
       
{/* This button text is the indicator of Versions of the website for our project. Initially in V1 of the website we kept the text

        //View server load
        
But now we are changing this to "V2 Canary Release" in V2 of the website)

*/} 
          V2 Canary Release
        </button>
      </div>

      {/* RIGHT PANEL: ORDER FORM */}
      <div className="order-panel">
        <header>
           <h2 className="section-title">Place Your Delivery Order</h2>
        </header>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerName" className="form-label">
              Your Name
            </label>
            <input
              id="customerName"
              type="text"
              placeholder="E.g., John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-base"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Delivery Address
            </label>
            <textarea
              id="address"
              placeholder="Full address, floor, apartment number..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-base"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="menuItem" className="form-label">
              Select Item
            </label>
            <select
              id="menuItem"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="input-base"
              disabled={loadingMenu}
              required
            >
              {menuItems.length === 0 && <option>Loading...</option>}
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (${item.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity" className="form-label">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-base input-quantity"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={submittingOrder || loadingMenu} 
            className="btn-primary"
          >
            {submittingOrder ? "Processing..." : "Place Order"}
          </button>
        </form>

        {message && (
          <p className={`message-box ${getMessageClass()}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
