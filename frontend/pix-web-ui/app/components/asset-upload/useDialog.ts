import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export function useDialog() {
  let [isOpen, setIsOpen] = useState(false);

  // close dialog on navigation event
  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === "loading") {
      setIsOpen(false);
    }
  }, [navigation.state]);

  // close dialog on Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
