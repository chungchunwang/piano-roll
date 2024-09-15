import background from "../assets/background.jpg";
import { SignInButton } from "@clerk/clerk-react";
function SignIn() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "left",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${background})`,
      }}
    >
      <div
        style={{
          padding: "30px",
          margin: "30px",
          borderRadius: "45px",
          backgroundColor: "white",
          opacity: "1",
          fontWeight: "400",
          fontFamily: "roboto",
        }}
      >
        <h1 style={{ color: "black" }}>Welcome to MITI!</h1>
        <i style={{ color: "black" }}>
          A new generation of music software awaits.
        </i>
        <div
          style={{
            margin: "10px",
          }}
        ></div>
        <SignInButton>
          {/* Add inline styles for red color */}
          <button className="sign">Sign In</button>
        </SignInButton>
      </div>
    </div>
  );
}

export default SignIn;
