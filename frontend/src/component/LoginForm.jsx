import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Constellation from "../../public/endless-constellation.svg";
import logo from "../../public/agentic_worker_logo.png";
import linkedinIcon from "../assets/linkedin.svg";
import twitterIcon from "../assets/twitter.svg";

function LoginForm({onLogin}) {
  const navigate = useNavigate();
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
      const res = await fetch("https://agentic-worker.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === "200") {
       onLogin()   
        navigate("/FileUploader");
      }
    } catch (error) {
      console.error("Error sending login request:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
        <img
          src={Constellation}
          alt="Endless constellation pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-18 pointer-events-none"
        />
        <div className="flex flex-col items-center justify-center relative z-10 bg-gradient-to-br from-gray-70 to-gray-800 w-130 h-120 rounded-3xl shadow-lg shadow-sky-900 border-2 border-gray-700">
          <img
            src={logo}
            alt="Logo"
            className="self-start mx-auto relative bottom-60 w-30 h-30 rounded-full border-4 border-gray-700 shadow-lg shadow-sky-900 pointer-events-none"
          />
          <div className="absolute w-100 h-90 flex flex-col items-center justify-center text-amber-50 text-2xl mt-10">
            <form
              onSubmit={handleSubmit}
              className="absolute flex flex-col items-center justify-center w-full h-full gap-5"
            >
              <div className="flex flex-row gap-5">
                {/** LinkedIn button */}
                <label
                  className={`
          relative flex items-center justify-center
          w-15 h-15 cursor-pointer
          rounded-full transition
          ${
            platform === "linkedin"
              ? "bg-gradient-to-br from-blue-600 to-blue-800"
              : "bg-transparent hover:bg-gray-700"
          }
        `}
                >
                  <input
                    type="radio"
                    name="platform"
                    value="linkedin"
                    className="sr-only"
                    checked={platform === "linkedin"}
                    onChange={() => setPlatform("linkedin")}
                  />
                  <img
                    src={linkedinIcon}
                    alt="LinkedIn"
                    className={`
            w-15 h-15 transition
            ${platform === "linkedin" ? "opacity-100" : "opacity-50"}
          `}
                  />
                </label>

                {/** Twitter button */}
                <label
                  className={`
          relative flex items-center justify-center
          w-15 h-15 cursor-pointer
          rounded-full transition
          ${
            platform === "twitter"
              ? "bg-gradient-to-br from-blue-400 to-blue-600"
              : "bg-transparent hover:bg-gray-700"
          }
        `}
                >
                  <input
                    type="radio"
                    name="platform"
                    value="twitter"
                    className="sr-only"
                    checked={platform === "twitter"}
                    onChange={() => setPlatform("twitter")}
                  />
                  <img
                    src={twitterIcon}
                    alt="Twitter"
                    className={`
            w-10 h-10 transition
            ${platform === "twitter" ? "opacity-100" : "opacity-50"}
          `}
                  />
                </label>
              </div>
              {platform === "linkedin" ? (
                <div className="flex flex-col gap-5">
                  <input
                    className="w-100 h-20 p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                    type="text"
                    placeholder="LinkedIn Username"
                    value={linkedinUsername}
                    onChange={(e) => setLinkedinUsername(e.target.value)}
                    required
                  />
                  <input
                    className="w-100 h-20 p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                    type="password"
                    placeholder="LinkedIn Password"
                    value={linkedinPassword}
                    onChange={(e) => setLinkedinPassword(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <input
                    type="text"
                    className="w-100 h-20 p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                    placeholder="Username / Email / Phone"
                    value={twitterIdentifier}
                    onChange={(e) => setTwitterIdentifier(e.target.value)}
                    required
                  />
                  <input
                    className="w-100 h-20 p-4 text-lg rounded-xl bg-white/10 backdrop-blur-md shadow-lg text-white placeholder-white/70 border border-white/20"
                    type="password"
                    placeholder="Twitter Password"
                    value={twitterPassword}
                    onChange={(e) => setTwitterPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                className="bg-amber-500 rounded-xl w-100 h-20 text-3xl shadow-2xl shadow-amber-900"
                type="submit"
              >
                Connect
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
