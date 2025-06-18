import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";
import styles from "./Payment.module.css";

function Payment() {
  const [imageUrl, setImageUrl] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [error, setError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [comment, setComment] = useState(""); // comment uchun state
  const [showQR, setShowQR] = useState(false); // QR ko‘rsatish holati

  const navigate = useNavigate();
  const location = useLocation();

  const { username, quantity, tonPrice, SERVICE_FEE_TON, STAR_PRICE_USD } = location.state || {};

  // Hisoblashlar
  const usdTotal = quantity * STAR_PRICE_USD;
  const tonAmount = (usdTotal / tonPrice) * SERVICE_FEE_TON;
  const amount_in_nano = Math.round(tonAmount * 1e9);
  // To'lov linki (tonLink)
  const tonLink = `ton://transfer/UQBsU4aZOASnH1pwkMAFDVHcVQs-34qlNu60ksEt3aDXJ8v-?amount=${amount_in_nano}&text=${encodeURIComponent(comment)}`;
  const Pendingo = () => {
    navigate("/pending", {
      state: { username, quantity,comment,amount_in_nano }
    });
  };
  // Countdown timer
  useEffect(() => {
    if (secondsLeft === 0) {
      navigate("/");
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, navigate]);

  // Foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    const fetchData = async () => {
      if (username && username.length >= 3) {
        try {
          const res = await fetch("https://tradingpro.uz/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: username, quantity: "50" }),
          });
          if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

          const data = await res.json();

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
      }
    };

    fetchData();
  }, [username]);

  // To‘lov linkini yaratish va comment olish
  useEffect(() => {
    async function createPaymentLink(username, quantity, tonAmount) {
      const data = { username, quantity, tonAmount };

      try {
        const response = await fetch("https://tradingpro.uz/generate-payment/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Server javobi xato: ${response.status}`);
        }

        const result = await response.json();
        setComment(result.comment);
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        alert("To‘lov linkini yaratishda muammo yuz berdi.");
      }
    }

    if (username && quantity && tonAmount) {
      createPaymentLink(username, quantity, tonAmount);
    }
  }, [username, quantity, tonAmount]);

  return (
    <div className={styles.container}>
      <button onClick={() => navigate("/")}>Orqaga</button>
      <h1>To'lov sahifasi</h1>
      <p>Sahifa 5 daqiqada so'ng yopiladi, iltimos to'lov qilishga shoshiling</p>
      <h2>Qolgan soniya: {secondsLeft}</h2>

      {imageUrl && (
        <div className={styles.profilePreview}>
          <img src={imageUrl} alt="Profil rasmi" className={styles.profileImg} />
          <div className={styles.name}>{fullName}</div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      <p>👤 Username: @{username}</p>
      <p>⭐ Stars soni: {quantity}</p>
      <p>💎 Ton to'lovi: {tonAmount.toFixed(6)}</p>
      <hr />
      <p>Ton address: UQBsU4aZOASnH1pwkMAFDVHcVQs-34qlNu60ksEt3aDXJ8v-</p>
      <p id="comment">Comment/meme/tag: {comment || "Yuklanmoqda..."}</p>

      <hr />
      <h2>To'lov uchun QR kod</h2>
      {!showQR ? (
        <button className={styles.tolovTek} onClick={() => setShowQR(true)} disabled={!comment}>
          QR kodni ko‘rsatish
        </button>
      ) : (
        <div style={{ background: "white", padding: "20px", display: "inline-block" }}>
          <QRCode value={tonLink} size={220} />
          
        </div>
      )}

      <hr />
      <h2>
        <a href={tonLink} target="_blank" rel="noopener noreferrer">
          To'lov uchun link
        </a>
      </h2>

      <div className={styles.parentContainer}>
        <button onClick={Pendingo}className={styles.tolovTek}>To'lovni tekshirish</button>
      </div>
    </div>
  );
}

export default Payment;
