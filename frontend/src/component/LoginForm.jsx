import React, { useState } from "react";

function LoginForm() {
  const [platform, setPlatform] = useState("linkedin");
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [linkedinPassword, setLinkedinPassword] = useState("");
  const [twitterIdentifier, setTwitterIdentifier] = useState("");
  const [twitterPassword, setTwitterPassword] = useState("");

  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload = {};

    if (platform === "linkedin") {
      payload = {
        platform,
        username: linkedinUsername,
        password: linkedinPassword,
      };
    } else {
      payload = {
        platform,
        identifier: twitterIdentifier, 
        password: twitterPassword,
      };
    }

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Server response:", data);
    } catch (error) {
      console.error("Error sending login request:", error);
    }
  };

  return (
    <>
      <div className="h-screen flex justify-center items-center bg-black">
        <div className="w-[500px] h-[300px]  flex justify-center items-center text-amber-50">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center"
          >
            <label
              className={platform === "linkedin" ? "text-2xl font-bold" : ""}
            >
              <input
                type="radio"
                name="platform"
                value="linkedin"
                checked={platform === "linkedin"}
                onChange={handlePlatformChange}
              />
              LinkedIn
            </label>
            <label
              className={platform === "twitter" ? "text-2xl font-bold" : ""}
            >
              <input
                type="radio"
                name="platform"
                value="twitter"
                checked={platform === "twitter"}
                onChange={handlePlatformChange}
              />
              Twitter
            </label>

            {platform === "linkedin" ? (
              <div className="flex flex-col gap-2">
                <input
                  className="w-full p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                  type="text"
                  placeholder="LinkedIn Username"
                  value={linkedinUsername}
                  onChange={(e) => setLinkedinUsername(e.target.value)}
                  required
                />
                <input
                  className="w-full p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                  type="password"
                  placeholder="LinkedIn Password"
                  value={linkedinPassword}
                  onChange={(e) => setLinkedinPassword(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  className="w-full p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                  placeholder="Username / Email / Phone"
                  value={twitterIdentifier}
                  onChange={(e) => setTwitterIdentifier(e.target.value)}
                  required
                />
                <input
                  className="w-full p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                  type="password"
                  placeholder="Twitter Password"
                  value={twitterPassword}
                  onChange={(e) => setTwitterPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
