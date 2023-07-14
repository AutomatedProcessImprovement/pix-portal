import {API_instance} from "../pix_axios";

export const getProjectFileForDownload = async (path: string) => {

  // Make a GET request to the API endpoint with the file path as a parameter
  console.log(import.meta.env.VITE_PIX_REACT_APP_BASE_URL)
  return await API_instance.get('/api/files/', {
    params: {
      file_path: path
    },
    responseType: 'blob' // Set the response type to 'blob' to handle binary data
  })
}
export const editExistingFileTitle = async (fileId: string, name: string) => {
  const formData = new FormData()
  formData.append('file_id', fileId)
  formData.append('name', name)
  return await API_instance.put(
    `/api/files/`,
    formData
  )
}
export const removeProjectFile = async (fid: number) => {
  return await API_instance.delete(
    `/api/files/${fid}`,
  )
}
export const uploadFile = async (file: File, tag: string, projectId: string) => {
  const formData = new FormData()
  formData.append('tag', tag)
  formData.append('project_id', projectId)
  formData.append('file', file)
  return await API_instance.post(
    `/api/files/`,
    formData
  )
}