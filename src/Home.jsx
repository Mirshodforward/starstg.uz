import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import TonIcon from './assets/ton_logo_light_background.svg';

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(50);
  
  const starOptions = [
    50, 75, 100, 150, 250, 300, 500, 750,
    1000, 1500, 2500, 5000, 10000, 25000, 50000, 100000
  ];
  const [tonPrice, setTonPrice] = useState(null);

useEffect(() => {
  async function fetchTonPrice() {
    try {
      const res = await fetch("https://tradingpro.uz/ton_price");
      const data = await res.json();
      if (data.price) {
        setTonPrice(data.price);
      }
    } catch (err) {
      console.error("TON narxini olishda xatolikzzz:", err);
    }
  }

  fetchTonPrice();
}, []);

// 1 star narxi USD'da
const STAR_PRICE_USD = 0.015;
const SERVICE_FEE_TON = 1.06;

const calculateTonPrice = (stars) => {
  if (!tonPrice) return "...";
  const usdTotal = stars * STAR_PRICE_USD;
  const tonAmount = (usdTotal / tonPrice) * SERVICE_FEE_TON;
  return tonAmount.toFixed(2); // Masalan, 0.225 TON
};

  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setUsername(value);

    if (value.length >= 3) {
      try {
        const response = await fetch("https://tradingpro.uz/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query: value, quantity: "50" })
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (data.found) {
          const photoHTML = data.found.photo || "";
          const name = data.found.name || "Ism topilmadi";

          const match = photoHTML.match(/src="([^"]+)"/);
          if (match) {
            setImageUrl(match[1]);
            setFullName(name);
            setError(null);
          } else {
            setImageUrl(null);
            setFullName(null);
            setError("Rasm topilmadi");
          }
        } else {
          setImageUrl(null);
          setFullName(null);
          setError("Foydalanuvchi topilmadi");
        }
      } catch (err) {
        setError("API xatolik: " + err.message);
        setImageUrl(null);
        setFullName(null);
      }
    } else {
      setImageUrl(null);
      setFullName(null);
      setError(null);
    }
  };

  const Paymentgo = () => {
    if (!username || count < 50) {
      alert("Iltimos, username va stars sonini to‘g‘ri kiriting! minumum 50ta");
      return;
    }

    navigate("/payment", {
      state: { username, quantity: count,tonPrice,SERVICE_FEE_TON,STAR_PRICE_USD }
    });
  };

  return (
    <div className="page-container">
      <header>
        <div className="brand-logo">Stars Paymee
      
        <button onClick={() => window.open("https://t.me/StarsPaymee_bot", "_blank")} className="button" style={{ "--clr": "#00ad54" }}>
        <span className="button-decor"></span>
        <div className="button-content">
        <div className="button__icon">
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" width="24">
                <circle opacity="0.5" cx="25" cy="25" r="23" fill="url(#icon-payments-cat_svg__paint0_linear_1141_21101)"></circle>
                <mask id="icon-payments-cat_svg__a" fill="#fff">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M34.42 15.93c.382-1.145-.706-2.234-1.851-1.852l-18.568 6.189c-1.186.395-1.362 2-.29 2.644l5.12 3.072a1.464 1.464 0 001.733-.167l5.394-4.854a1.464 1.464 0 011.958 2.177l-5.154 4.638a1.464 1.464 0 00-.276 1.841l3.101 5.17c.644 1.072 2.25.896 2.645-.29L34.42 15.93z">
                    </path>
                </mask>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M34.42 15.93c.382-1.145-.706-2.234-1.851-1.852l-18.568 6.189c-1.186.395-1.362 2-.29 2.644l5.12 3.072a1.464 1.464 0 001.733-.167l5.394-4.854a1.464 1.464 0 011.958 2.177l-5.154 4.638a1.464 1.464 0 00-.276 1.841l3.101 5.17c.644 1.072 2.25.896 2.645-.29L34.42 15.93z" fill="#fff"></path>
                <path d="M25.958 20.962l-1.47-1.632 1.47 1.632zm2.067.109l-1.632 1.469 1.632-1.469zm-.109 2.068l-1.469-1.633 1.47 1.633zm-5.154 4.638l-1.469-1.632 1.469 1.632zm-.276 1.841l-1.883 1.13 1.883-1.13zM34.42 15.93l-2.084-.695 2.084.695zm-19.725 6.42l18.568-6.189-1.39-4.167-18.567 6.19 1.389 4.166zm5.265 1.75l-5.12-3.072-2.26 3.766 5.12 3.072 2.26-3.766zm2.072 3.348l5.394-4.854-2.938-3.264-5.394 4.854 2.938 3.264zm5.394-4.854a.732.732 0 01-1.034-.054l3.265-2.938a3.66 3.66 0 00-5.17-.272l2.939 3.265zm-1.034-.054a.732.732 0 01.054-1.034l2.938 3.265a3.66 3.66 0 00.273-5.169l-3.265 2.938zm.054-1.034l-5.154 4.639 2.938 3.264 5.154-4.638-2.938-3.265zm1.023 12.152l-3.101-5.17-3.766 2.26 3.101 5.17 3.766-2.26zm4.867-18.423l-6.189 18.568 4.167 1.389 6.19-18.568-4.168-1.389zm-8.633 20.682c1.61 2.682 5.622 2.241 6.611-.725l-4.167-1.39a.732.732 0 011.322-.144l-3.766 2.26zm-6.003-8.05a3.66 3.66 0 004.332-.419l-2.938-3.264a.732.732 0 01.866-.084l-2.26 3.766zm3.592-1.722a3.66 3.66 0 00-.69 4.603l3.766-2.26c.18.301.122.687-.138.921l-2.938-3.264zm11.97-9.984a.732.732 0 01-.925-.926l4.166 1.389c.954-2.861-1.768-5.583-4.63-4.63l1.39 4.167zm-19.956 2.022c-2.967.99-3.407 5.003-.726 6.611l2.26-3.766a.732.732 0 01-.145 1.322l-1.39-4.167z" fill="#fff" mask="url(#icon-payments-cat_svg__a)"></path>
                <defs>
                    <linearGradient id="icon-payments-cat_svg__paint0_linear_1141_21101" x1="25" y1="2" x2="25" y2="48" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#fff" stop-opacity="0.71"></stop>
                        <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
                    </linearGradient>
                </defs>
            </svg>
        </div>
        <span className="button__text">Botni ko'rish</span>
    </div>
</button>
        </div>
        
      </header>

      <main className="content-area">
        {imageUrl && (
          <div className="profile-preview">
            <img src={imageUrl} alt="Profil rasmi" className="profile-img" />
            <div className="name">{fullName}</div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <input
          type="text"
          id="username"
          placeholder="Enter username"
          value={username}
          onChange={handleUsernameChange}
        />

        <input
          type="number"
          id="stars"
          placeholder="Nechta stars?"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />

        <div className="star-buttons">
          {starOptions.map((val) => (
            <button
            key={val}
            className={`narx-button ${count === val ? "selected" : ""}`}
            onClick={() => setCount(val)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
          >
            <span>⭐ {val.toLocaleString("en-US")} Stars</span>
            <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              {tonPrice ? (
                <>
                {`${calculateTonPrice(val)} `}
                  <img src={TonIcon} alt="TON" style={{ width: 70, height: 70 }} />
                  
                </>
              ) : (
                "yuklanmoqda..."
              )}
            </span>
          </button>
          ))}
        </div>
      </main>

      <div className="end-button">
        <button onClick={Paymentgo} className="main-narx-button">
          ⭐ {count.toLocaleString("en-US")} Stars olish
        </button>
        <footer>
          <p>
            &copy; 2025 <b>StarsPaymee</b> All rights reserved
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Home;
