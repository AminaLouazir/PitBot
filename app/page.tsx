"use client";

import { useChat } from '@ai-sdk/react';
import Image from "next/image";
import f1_chatbot_logo from "./assests/f1_logo.png";
import { Message } from "ai";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionRow";


const Home = () => {

  const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();

  const noMessages = !messages || messages.length === 0;

  const onPromptClick = (promptText: string) => {
      const msg: Message = {
          id: crypto.randomUUID(),
          content: promptText,
          role: "user",
      };
      append(msg);
  };

  return (
      <main className="main">
          {/* Logo */}
          <Image
              src={f1_chatbot_logo}
              width="250"
              height="250"
              alt="F1GPT Logo"
              className=""
          />

          <section className={noMessages ? "" : "populated"}>
              {noMessages ? (
                  <>
                      <p className="starter-text">
                      Your ultimate pit stop for everything Formula One!🏎️🏁
                      </p>
                      <br />
                      <PromptSuggestionRow onPromptClick={onPromptClick} />
                  </>
              ) : (
                  <>
                      {messages.map((message, index) => <Bubble key={`message-${index}`} message={message} />)}
                      {isLoading && <LoadingBubble />}
                  </>
              )}
          </section>
          <form onSubmit={handleSubmit}>
              <input type="text" name="" id="" className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me something..." />
              <input type="submit" value="Vroom " />
          </form>
      </main>
  )
};

export default Home;