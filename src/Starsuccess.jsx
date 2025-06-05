import { useNavigate, useLocation } from "react-router-dom";

function Starsuccess(){

    const navigate = useNavigate();

    return(
      <div>
           <h4>⭐ Stars muvaffaqiyatli yuborildi </h4>
           <button onClick={() => navigate("/")}> bosh sahifaga </button>
      </div>
            
             
    )

}
export default Starsuccess