import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Pending.css";

function Pending() {
    const navigate = useNavigate();
    const location = useLocation();
    const { username, quantity, comment, amount_in_nano } = location.state || {};
    const [visible, setVisible] = useState(false);
    const [checking, setChecking] = useState(true);
    const [success, setSuccess] = useState(false);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    const clearTimers = () => {
        clearInterval(intervalRef.current);
        clearTimeout(timeoutRef.current);
    };

    // Backendga stars sotib olishni so‘rov yuborish
    async function sendBuyStars() {
        try {
            const response = await fetch("https://tradingpro.uz/buy-stars", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, quantity }),
            });
            const data = await response.json();

            if (data.success) {
                // To'lov tasdiqlangani alertni bu yerda chiqarish
                alert("To'lov tasdiqlandi! Stars muvaffaqiyatli yuborildi.");
                // Yangi sahifaga yo'naltirish (React Router)
                navigate("/starsuccess");
            } else {
                alert("Stars yuborishda muammo yuz berdi.");
            }
        } catch (error) {
            console.error("Xatolik:", error);
            alert("Tarmoqda xatolik yuz berdi.");
        }
    }

    const startChecking = () => {
        setChecking(true);
        setSuccess(false);

        const checkPayment = async () => {
            if (!comment || !amount_in_nano) {
                alert("To'lov uchun yetarli ma'lumot mavjud emas");
                clearTimers();
                setChecking(false);
                return;
            }
            try {
                const res = await fetch("https://tradingpro.uz/check-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ comment, amount_in_nano }),
                });
                const data = await res.json();
                if (data.success) {
                    setSuccess(true);
                    setChecking(false);
                    clearTimers();
                    // Stars yuborish funksiyasini chaqirish
                    await sendBuyStars();
                }
            } catch (error) {
                console.error("Xatolik yuz berdi:", error);
            }
        };

        // Darhol tekshirish
        checkPayment();

        // Har 2 sekundda poll qilish
        intervalRef.current = setInterval(() => {
            if (!success) checkPayment();
        }, 2000);

        // 20 sekunddan keyin to‘xtatish
        timeoutRef.current = setTimeout(() => {
            if (!success) {
                alert("To'lov topilmadi yoki miqdor yetarli emas.");
                setChecking(false);
                clearTimers();
            }
        }, 20000);
    };

    useEffect(() => {
        setVisible(true);
        startChecking();

        return () => clearTimers();
    }, []);

    return (
        <div className={`pending-container ${visible ? "fade-in" : ""}`}>
            <button className="back-button" onClick={() => navigate("/")}>⬅️ Orqaga</button>
            <h1 className="pulsate-text">Iltimos, kutib turing...</h1>
            <h2>{username}</h2>
            <h2>{quantity}</h2>
            <h2>{comment}</h2>
            <h2>{amount_in_nano}</h2>

            <div className="loader"></div>
            <p className="checking-text">
                {checking ? "To'lov amalga oshirilganligini tekshiryapmiz" : (success ? "To'lov tasdiqlandi!" : "To'lov topilmadi")}
            </p>

            <button
                className="retry-button"
                onClick={() => {
                    clearTimers();
                    startChecking();
                }}
                disabled={checking} 
            >
                Qayta tekshirish
            </button>
        </div>
    );
}

export default Pending;
