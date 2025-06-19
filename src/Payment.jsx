import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate, useLocation } from "react-router-dom";
import "./Payment.css";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    username = "demo_user",
    quantity = 1,
    tonPrice = 7,
    SERVICE_FEE_TON = 1.01,
    STAR_PRICE_USD = 1
  } = location.state || {};

  const [imageUrl, setImageUrl] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const [comment, setComment] = useState("");
  const [qrReady, setQrReady] = useState(false);

  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payError, setPayError] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStage, setModalStage] = useState("sending"); // 'sending', 'success', 'error'

  // Hisoblashlar
  const usdTotal = quantity * STAR_PRICE_USD;
  const tonAmount = (usdTotal / tonPrice) * SERVICE_FEE_TON;
  const amount_in_nano = Math.round(tonAmount * 1e9);
  const tonAddress = "UQBsU4aZOASnH1pwkMAFDVHcVQs-34qlNu60ksEt3aDXJ8v-";
  const tonLink = `ton://transfer/${tonAddress}?amount=${amount_in_nano}&text=${encodeURIComponent(comment)}`;

  // Profilni olish
  useEffect(() => {
    if (!username) return;
    fetch("https://tradingpro.uz/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: username, quantity: "50" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.found) {
          const photoHTML = data.found.photo || "";
          const name = data.found.name || "Ism topilmadi";
          const match = photoHTML.match(/src="([^"]+)"/);
          if (match) setImageUrl(match[1]);
          setFullName(name);
          setProfileError(null);
        } else {
          setProfileError("Foydalanuvchi topilmadi");
        }
      })
      .catch(() => setProfileError("Profil yuklanmadi"));
  }, [username]);

  // Payment comment/qr uchun
  useEffect(() => {
    setQrReady(false);
    setComment("");
    fetch("https://tradingpro.uz/generate-payment/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, quantity, tonAmount }),
    })
      .then((res) => res.json())
      .then((data) => {
        setComment(data.comment);
        setQrReady(true);
      })
      .catch(() => setComment("Xatolik"));
  }, [username, quantity, tonAmount]);

  // To‘lovni tekshirish
  const checkPayment = async () => {
    if (!comment || !amount_in_nano) return;
    setChecking(true);
    setPayError(false);
    try {
      const res = await fetch("https://tradingpro.uz/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, amount_in_nano }),
      });
      const data = await res.json();
      if (data.success) {
        setPaid(true);
        setChecking(false);
        setShowModal(true);
        setModalStage("sending");
        // Modal ochilganida yulduz yuborish
        setTimeout(() => sendBuyStars(), 1100);
      } else {
        setPaid(false);
        setChecking(false);
        setPayError(true);
        setTimeout(() => setPayError(false), 1200); // error animatsiya
      }
    } catch {
      setPaid(false);
      setChecking(false);
      setPayError(true);
      setTimeout(() => setPayError(false), 1200);
    }
  };

  // buy-stars funksiyasi
  const sendBuyStars = async () => {
    try {
      const res = await fetch("https://tradingpro.uz/buy-stars", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setModalStage("success");
      } else {
        setModalStage("error");
      }
    } catch {
      setModalStage("error");
    }
  };

  // Modal conteneti
  const renderModalContent = () => {
    if (modalStage === "sending") {
      return (
        <>
          <div className="star-anim">&#11088;</div>
          <div className="modal-text">Stars yuborilmoqda...</div>
        </>
      );
    }
    if (modalStage === "success") {
      return (
        <>
          <div className="star-anim finished">&#11088;</div>
          <div className="modal-text">⭐ Stars muvaffaqiyatli yuborildi!</div>
          <button
            className="main-btn"
            style={{ marginTop: 20 }}
            onClick={() => {
              setShowModal(false);
              navigate("/");
            }}
          >
            Bosh sahifaga
          </button>
        </>
      );
    }
    if (modalStage === "error") {
      return (
        <>
          <div className="star-anim error">&#10060;</div>
          <div className="modal-text">Xatolik: Stars yuborilmadi.<br/> Qayta urinib ko‘ring.</div>
          <button
            className="main-btn"
            style={{ marginTop: 20, background: "#e94f4f" }}
            onClick={() => {
              setModalStage("sending");
              setTimeout(() => sendBuyStars(), 700);
            }}
          >
            Qayta yuborish
          </button>
        </>
      );
    }
    return null;
  };

  // Tugma klassi va text
  const btnClass =
    paid
      ? "pay-btn paid"
      : payError
      ? "pay-btn error"
      : checking
      ? "pay-btn checking"
      : "pay-btn";
  const btnText = paid
    ? "To‘langan"
    : checking
    ? "Tekshirilmoqda..."
    : "To‘lanmagan";

  return (
    <div className="payment-container">
      <button className="back-btn" onClick={() => navigate("/")}>⬅️ Orqaga</button>
      <h1>To'lov sahifasi</h1>

      <div className="profile-preview">
        {imageUrl ? (
          <img src={imageUrl} alt="Profil rasmi" className="profile-img" />
        ) : (
          <div className="img-skeleton" />
        )}
        <div className="name">{fullName || "..."}</div>
        {profileError && <div className="error">{profileError}</div>}
      </div>

      <div className="details">
        <p>@{username} ga {quantity}⭐ Stars olinmoqda!</p>
        <p>💎 Ton to'lovi: {tonAmount.toFixed(6)} </p>
        {/* <p>{tonAddress} manzilga {tonAmount.toFixed(6)}💎 Tonni quyidagi camment orqali yuboring</p> */}
        {/* <p>Comment: <b>{comment || "Yuklanmoqda..."}</b></p> */}
        <p> Qr code ustiga bosing Yoki tonkeeper orqali scanerlang!</p>
      </div>
      
      <div className="qr-block">
  {!qrReady ? (
    <div className="qr-loader">QR code yuklanmoqda...</div>
  ) : (
    <a href={tonLink} target="_blank" rel="noopener noreferrer" style={{display: "inline-block"}}>
      <QRCode value={tonLink} size={220} />
      {/* Istasangiz ustiga hover effekti ham CSS bilan qo‘shishingiz mumkin */}
    </a>
  )}
</div>

      
      <button
        className={btnClass}
        onClick={paid ? undefined : checkPayment}
        disabled={checking}
        style={{ marginTop: 30 }}
      >
        {btnText}
      </button>
      

      {/* Modal (stars yuborilmoqda, muvaffaqiyatli, yoki xatolik) */}
      {showModal && (
        <div className="modal-blur">
          <div className="modal-content">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}