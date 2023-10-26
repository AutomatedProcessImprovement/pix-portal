import { projectsURL } from "~/services/backend_urls";
import axios from "axios";
import { User } from "~/utils";

export async function listProjectsForUser(user: User) {
  const { data } = await axios.get(projectsURL, {
    headers: {
      Authorization: `Bearer ${user.token!}`,
    },
    params: {
      email: user.email,
    },
  });
  return data;
}
