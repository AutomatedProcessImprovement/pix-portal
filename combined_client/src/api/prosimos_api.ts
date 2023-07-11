import axios from "../prosimos_axios";

export const simulate = async (startDate: string, numProcesses: number,
    newJsonFile: Blob | File, bpmnFile: Blob | File
) => {
    const formData = new FormData()
    formData.append("startDate", startDate)
    formData.append("numProcesses", numProcesses.toString())
    formData.append("simScenarioFile", newJsonFile as Blob)
    formData.append("modelFile", bpmnFile as Blob)

    return await axios.post(
        '/prosimos/simulate',
        formData)
};

export const getFileByFileName = async (fileName: string) => {
    return await axios.get(
        `/prosimos/simulationFile?fileName=${fileName}`
    )
};

export const getTaskByTaskId = async (taskId: string) => {
    return await axios.get(
        `/prosimos/task?taskId=${taskId}`
    )
};

export const discoverScenariosParams = async (selectedLogsFile: Blob, 
    selectedBpmnFile: Blob
) => {
    const formData = new FormData()
    formData.append("logsFile", selectedLogsFile)
    formData.append("bpmnFile", selectedBpmnFile)

    return axios.post(
        '/prosimos/discovery',
        formData)
};
