import { useEffect, useState } from "react";

const useJsonFile = <T>(jsonFile: File | Blob | null) => {
  const [jsonData, setJsonData] = useState<T>();

  useEffect(() => {
    if (jsonFile !== null) {
      const jsonFileReader = new FileReader();
      jsonFileReader.readAsText(jsonFile, "UTF-8");
      jsonFileReader.onload = (e) => {
        if (e.target?.result && typeof e.target?.result === "string") {
          const rawData = JSON.parse(e.target.result);
          setJsonData(rawData);
        }
      };
    }
  }, [jsonFile]);
  return { jsonData };
};

export default useJsonFile;
