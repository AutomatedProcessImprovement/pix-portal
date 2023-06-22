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

export const removeProjectFile = async (fid: number) => {
  return await axios.delete(
    `/remove/${fid}`,
  )
}

export const uploadFile = async (file: File, tags: string[], projectId: number) => {
  const formData = new FormData()
  formData.append('name', file.name)
  formData.append('tags', tags)
  formData.append('projectId', projectId)
  formData.append('file',file)
  // console.log(formData)
  return await axios.post(
    `/upload/`,
    formData
  )
}