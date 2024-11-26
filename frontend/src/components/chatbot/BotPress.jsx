import { Webchat, WebchatProvider, Fab, getClient } from "@botpress/webchat";
import { buildTheme } from "@botpress/webchat-generator";
import { useState } from "react";

const { theme, style } = buildTheme({
  themeName: "prism",
  themeColor: "#634433",
});

//Add your Client ID here ⬇️
const clientId = import.meta.env.VITE_BOTPRESS_CLIENT_ID;

const BotPress = () => {
  const client = getClient({ clientId });
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);

  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState);
  };

  return (
    <div className="w-full h-full">
      <WebchatProvider theme={theme} client={client}>
        <Fab
          onClick={toggleWebchat}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 100, // Ensure FAB is on top
          }}
        />

        {/* Webchat Modal */}
        <div
          messageId={null}
          style={{
            display: isWebchatOpen ? "block" : "none", // Toggle visibility based on state
            position: "fixed",
            bottom: "80px", // Adjust for space above FAB
            right: "20px",
            width: "350px", // Width of the chat window
            maxHeight: "500px", // Limit the height
            zIndex: 9999, // Ensure the chat is above other content
            backgroundColor: "#fff", // Optional, for chat background color
            borderRadius: "8px", // Optional, rounded corners
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Optional, shadow effect
            overflowY: "auto", // Make it scrollable if content overflows
          }}
        >
          <Webchat />
        </div>
      </WebchatProvider>
    </div>
  );
};

export default BotPress;
