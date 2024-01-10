import { createContext } from "react";
import type { User } from "~/services/auth";

export const UserContext = createContext<User | null>(null);
