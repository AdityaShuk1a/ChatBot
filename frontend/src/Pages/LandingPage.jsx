import React, { useState, useEffect } from "react";
import SideBar from "../Components/SideBar";
import { GoogleGenAI } from "@google/genai";
import SendIcon from "@mui/icons-material/Send";
import NavBar from "../Components/NavBar";


function LandingPage() {
  const [startChatting, setStartChatting] = useState(false);
  const [input, setInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [chatNumber, setChatNumber] = useState(0);
  const [chats, setChats] = useState([
    {
      id: 0,
      title: "",
      messages: [],
    },
  ]);


  const setNewChatNumber = (number) => {
    setChatNumber(number);
  }
  useEffect(() => {
    if (input.length === 0) return;

    const ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_API_KEY,
    });

    const AI = async () => {
      setStartChatting(true);

      const currentChat = chats.find((chat) => chat.id === chatNumber);

      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: currentChat.messages.map((message) => ({
          role: message.person,
          parts: [{ text: message.text }],
        })),
      });

      const response = await chat.sendMessage({
        message: `You are a clever and witty Riddle Master chatbot. You have four responsibilities:

        1. *Solving Riddles*: If the user sends a riddle, try to give the most logical and witty answer. If you're not 100% sure, explain your reasoning and give your best guess.
        
        2. *Sharing Riddles*: If the user asks for a riddle, respond with a challenging but fun one. Do NOT reveal the answer unless the user specifically asks for it.
        
        3. *Providing Hints*: If the user attempts to solve a riddle but gets it wrong, respond encouragingly and give a small, clever hint to guide them toward the correct answer. Keep the hint cryptic but helpful.
        
        4. *Casual Chit-Chat Handling*: If the user says something casual like "hey", "hi", "hello", "what's up", etc., respond with a short, witty line to grab attention, then offer a riddle or invite them to stump you.
        
        Maintain a fun, intelligent tone. Always bring the conversation back to riddles.
        
        Examples:
        - User: "Give me a riddle"
        - Gemini: "I have keys but no locks, space but no room. You can enter, but you can’t go outside. What am I?"
        
        - User: "Is it a keyboard?"
        - Gemini: "Bingo! That’s a keyboard. Nailed it!"
        
        - User: "Is it a piano?"
        - Gemini: "Close, but not quite! Hint: You enter things into it, not just play music."
        
        - User: "hello"
        - Gemini: "Ah, a curious mind enters. Want a riddle or ready to drop one on me?"
        ` + input,
      });

      const botReply = response.text;

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatNumber
            ? {
                ...chat,
                title: chat.title || botReply.split(".")[0], // Use 1st sentence as title
                messages: [
                  ...chat.messages,
                  { text: input, person: "user" },
                  { text: botReply, person: "model" },
                ],
              }
            : chat
        )
      );

      setInput("");
      setUserInput("");
    };

    AI();
  }, [input]);

  useEffect(() => {
    console.log(chats)
  }, [chats])

  // Create new chat only if current chat has messages
  const startNewChat = () => {
    const currentChat = chats.find((chat) => chat.id === chatNumber);
    if (currentChat && currentChat.messages.length > 0) {
      const newChatId = chatNumber + 1;
      setChats((prev) => [
        ...prev,
        { id: newChatId, title: "", messages: [] },
      ]);
      setChatNumber(newChatId);
      setInput("");
      setUserInput("");
      setStartChatting(false);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", (e)=>{
      if (e.key === "Enter") {
        setInput(userInput);
      }
    })

    removeEventListener("keydown", (e)=>{
      if (e.key === "Enter") {
        setInput(userInput);
      }
    })
  })
  const currentChat = chats.find((chat) => chat.id === chatNumber);

  return (
    <>
    <NavBar />
    <div className="h-screen w-screen bg-black flex">
      
      <SideBar chats={chats} chatNumber={chatNumber} setNewChatNumber={setNewChatNumber} startNewChat={startNewChat}   />
      <div className="h-full w-full flex justify-center items-center text-white text-3xl">
        <div
          className="w-full h-full flex items-center justify-center flex-col"
          style={{ padding: "1vh" }}
        >
          {!startChatting ? (
            <>
              <h1 className="text-center"  style={{ marginBottom: "2vh" }}>
                Want some interesting Riddles
              </h1>
              <div className="text w-full flex justify-center ">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Search"
                  className="w-[60%] h-10 rounded-3xl text-xl text-white border-white border-[0.5px] bg-transparent"
                  style={{
                    padding: "1vh",
                    marginRight: "0.5vh",
                  }}
                />
                <SendIcon
                  className="text-8xl rounded-3xl cursor-pointer flex justify-center items-center"
                  style={{ fontSize: "4vh" }}
                  onClick={() => setInput(userInput)}
                />
              </div>
            </>
          ) : (
            <>
              {/* Chat Display */}
              <div className="w-full h-[70%]  justify-center flex " style={{
                marginTop: "-12vh"
              }} >
                <div className="overflow-y-auto w-[60%] h-full">
                 
                  {currentChat?.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-2 ${
                        msg.person === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <p
                        className="inline-block rounded-2xl text-lg md:text-xl"
                        style={{
                          padding: "2vh",
                          backgroundColor:
                            msg.person === "user" ? "#333" : "",
                        }}
                      >
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="text w-full bottom-[7vh] fixed flex justify-center mt-4">
                  <input
                    type="text"
                    placeholder="Type a riddle..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-[60%] h-10 rounded-3xl text-xl border-white border-[0.5px] bg-transparent text-white"
                    style={{
                      padding: "1vh",
                      marginRight: "0.5vh",
                    }}
                  />
                  <SendIcon
                    className="rounded-3xl h-10 cursor-pointer px-4 flex justify-center items-center"
                    style={{ fontSize: "4vh" }}
                    onClick={() => setInput(userInput)}
                  />
                  
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
    
  );
}

export default LandingPage;
