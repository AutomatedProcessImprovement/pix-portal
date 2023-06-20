import axios from "../axios";

export const getProjects = async () => {
  return await axios.get(
    `/projects/`
  )
}

export const getProjectFiles = async (project_id: number) => {
  console.log(project_id)
  return await axios.get(
    `/projects/${project_id}`
  )
}

export const createNewProject = async (name: string) => {
  const formData = new FormData()
  formData.append('name', name)
  return await axios.post(
    `/create/`,
    formData
  )
}