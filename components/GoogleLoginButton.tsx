import { loginWithGoogle } from "../services/authService";

export default function GoogleLoginButton({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  async function handleGoogleLogin() {
    try {
      const user = await loginWithGoogle();
      console.log("✅ Logged in with Google:", user);
      alert("Welcome " + user.displayName);
      if (onLoginSuccess) onLoginSuccess(); // ✅ notify parent
    } catch (err) {
      console.error("❌ Google login error:", err);
      alert("Login failed: " + (err as Error).message);
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "white",
        cursor: "pointer"
      }}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        style={{ width: "20px", marginRight: "8px" }}
      />
      Sign in with Google
    </button>
  );
}
