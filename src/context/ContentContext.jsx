import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initWebpCheck } from "../utils/imageUrl";

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initWebpCheck().then(fetchContent);
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/acf/values/structured");
      if (!response.ok) throw new Error("Failed to fetch content");
      const data = await response.json();
      setContent(data);
    } catch (err) {
      console.warn("Failed to fetch ACF content:", err.message);
      setContent({});
    } finally {
      setLoading(false);
    }
  };

  const getField = useCallback((location, group, fieldName) => {
    return content?.[location]?.[group]?.[fieldName]?.value ?? null;
  }, [content]);

  const getGroup = useCallback((location, group) => {
    const groupData = content?.[location]?.[group];
    if (!groupData) return {};
    const { _meta, ...fields } = groupData;
    const result = {};
    Object.entries(fields).forEach(([key, field]) => {
      result[key] = field.value;
    });
    return result;
  }, [content]);

  return (
    <ContentContext.Provider value={{ content, loading, fetchContent, getField, getGroup }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
