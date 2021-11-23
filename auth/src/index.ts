import app from "./app";

const setup = async () => {
  app.listen("5000", () =>
    console.log("Auth server is listening on port 5000")
  );
};

setup();
