const NODE_ENV = process.env["NODE_ENV"];
export const getEnvFilePath = () => {
  return (
    ".env" + (NODE_ENV === "local" ? ".local" : NODE_ENV === "development" ? ".development" : "")
  );
};
