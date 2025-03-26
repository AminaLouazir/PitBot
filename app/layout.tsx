import  "./global.css"

export const metadata ={
    title: "PitBot",
    description: "Your ultimate pit stop for everything Formula One!🏎️🏁",
};

const RootLayout = ({ children }) => {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  };
  
export default RootLayout;